(function (window, document) {
	var config = {
		formId: 'myForm',
		fields: {
			fio: {
				type: 'fio'
			},
			email: {
				type: 'email'
			},
			phone: {
				type: 'phone'
			}
		},
		submitId: 'submitButton',
		resultContainerId: 'resultContainer',
		classNames: {
			input: {
				error: 'error'
			},
			resultContainer: {
				error: 'error',
				progress: 'progress'
			}
		}
	};

	var cachedElements = {
		form: document.getElementById(config.formId),
		submit: document.getElementById(config.submitId),
		resultContainer: document.getElementById(config.resultContainerId)
	};

	var _formHandler = {
		init: function () {
			console.log('init form');

			this.handler();
		},
		handler: function () {
			cachedElements.form.addEventListener('submit', function (e) {
				e.preventDefault();

				MyForm.submit();
			});
		},
		disableSubmitButton: function (disabled) {
			cachedElements.submit.disabled = disabled;
		},
		request: function (data) {
			var data = MyForm.getData();

			console.log('request');
		},
		showErrors: function () {
			console.log('showErrors');
		},
		validate: {
			fio: function (value) {
				var regex = /([а-яa-z]+)/i;
				var data = value.trim().replace(/\s+/g, ' ').split(' ');
				var isValid;

				if (data.length !== 3) {
					return false;
				}

				isValid = data.every(function(word) {
					return regex.test(word.trim());
				});

				return isValid;
			},
			email: function (email) {

			},
			phone: function (phone) {
				
			}
		}
	};

	var MyForm = {
		validate: function () {
			var results = {
				isValid: true
			};

			var data = this.getData();

			for (var key in data) {
				var isValid = _formHandler.validate[config.fields[key].type](data[key]);

				if (isValid === false) {
					results.isValid = false;

					if (!results.errorFields) {
						results.errorFields = [];
					}

					results.errorFields.push(key);
				}
			}

			return results;
		},
		getData: function () {
			var data = {};

			for (var key in config.fields) {
				var value = cachedElements.form[key].value;

				data[key] = value;
			}

			return data;
		},
		setData: function (data) {
			if (data) {
				for (var key in config.fields) {
					var value = data[key];

					if (value !== undefined) {
						cachedElements.form[key].value = value;
					}
				}
			} else {
				console.error('setData: wrong data');
			}
		},
		submit: function () {
			_formHandler.disableSubmitButton(true);

			var validateForm = this.validate();
			
			if (validateForm.isValid === true) {
				_formHandler.request();
			} else {
				_formHandler.showErrors(validateForm.errorFields);

				_formHandler.disableSubmitButton(false);
			}
		}
	};

	_formHandler.init();

	window.MyForm = MyForm;

})(window, document);
