function Validator(options) {
    let selectorRules = {}

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    function validate(inputElement, rule) {
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        let errorMessage
        let rules = selectorRules[rule.selector]
            //Lọc qua từng rule của inputElemet
        for (let i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break
        }
        if (errorMessage) {
            errorElement.innerHTML = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            errorElement.innerText = ''
        }
        return !!errorMessage
    }
    //Lấy element của form 
    let formElement = document.querySelector(options.form)
    if (formElement) {
        //submit cho cả form
        formElement.onsubmit = function(e) {
            e.preventDefault()
            let isFormValid = true
            options.rules.forEach(function(rule) {
                let inputElements = formElement.querySelectorAll(rule.selector)
                Array.from(inputElements).forEach(function(inputElement) {
                    let isValid = validate(inputElement, rule)
                    if (isValid) {
                        isFormValid = false
                    }
                })
            })
            if (isFormValid) {
                if (typeof options.onSubmit == 'function') {
                    let enableInput = formElement.querySelectorAll('[name]')
                    let formValue = Array.from(enableInput).reduce(function(value, input) {
                        switch (input.type) {
                            case 'radio':
                                switch (input.checked) {
                                    case true:
                                        value[input.name] = input.value
                                }
                                break
                            case 'checkbox':
                                switch (Array.isArray(value[input.name])) {
                                    case false:
                                        value[input.name] = []
                                    case true:
                                        switch (input.checked) {
                                            case true:
                                                value[input.name].push(input.value)
                                        }
                                }
                                break
                            default:
                                value[input.name] = input.value
                        }
                        return value
                            // return (value[input.name] = input.value) && value
                    }, {})
                    options.onSubmit(formValue)
                } else {
                    formElement.submit()
                }
            }
        }
        options.rules.forEach(function(rule) {
            // Lưu lại các rule cho inputElement
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            let inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement) {
                if (inputElement) {
                    //Xử lí trường hợp blur khỏi input
                    inputElement.onblur = function() {
                            validate(inputElement, rule)
                        }
                        //Xử lí khi nhập thông tin vào input
                    inputElement.oninput = function() {
                        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                        errorElement.innerText = ''
                    }
                }
            })
        })
    }
}

Validator.isRequired = function(selector, message) {
    return {
        selector,
        test: function(value) {
            let checkedElements = document.querySelectorAll(selector)
            let ischeckd = false
            Array.from(checkedElements).forEach(function(checkedElement) {
                switch (checkedElement.type) {
                    case 'checkbox':
                    case 'radio':
                        // if (checkedElement.checked) {
                        //     ischeckd = true
                        //     console.log(ischeckd)
                        // }
                        switch (checkedElement.checked) {
                            case true:
                                ischeckd = true
                                break
                            case false:
                                ischeckd = ischeckd
                        }
                        output = ischeckd ? undefined : message || 'Vui lòng nhập trường này'

                        break
                    default:
                        output = value.trim() ? undefined : message || 'Vui lòng nhập trường này'
                }
            })
            return output
        }
    }
}


Validator.isEmail = function(selector, message) {
    return {
        selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Email không hợp lệ'
        }
    }
}
Validator.minLength = function(selector, min, message) {
    return {
        selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}
Validator.isConfirmed = function(selector, element, message) {

    return {
        selector,
        test: function(value) {
            let passwordElement = document.querySelector(element)
            return value === passwordElement.value ? undefined : message || 'Mật khẩu không khớp'
        }
    }
}