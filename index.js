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

	var cacheElements = {
		form: document.getElementById(config.formId),
		submit: document.getElementById(config.submitId),
		resultContainer: document.getElementById(config.resultContainerId),
	};

	var _formHandler = {
		init: function () {
			console.log('init form');

			this.handler();
		},
		handler: function () {
			cacheElements.form.addEventListener('submit', function (e) {
				e.preventDefault();

				MyForm.submit();
			});
		}
	};


	var MyForm = {
		validate: function () {
			
		},
		getData: function () {
			
		},
		setData: function (data) {
			
		},
		submit: function () {
			console.log('submit');
		}
	};

	window.MyForm = MyForm;

	_formHandler.init();
})(window, document);
