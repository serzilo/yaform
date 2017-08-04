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
				default:  'results',
				success:  'success',
				error:    'error',
				progress: 'progress',
				fail:     'fail'
			}
		},
		maxPhoneDigitsSum: 30,
		statuses: {
			SUCCESS:  'success',
			ERROR:    'error',
			PROGRESS: 'progress',
			FAIL:     'fail'
		}
	};

	var cachedElements = {
		form:            document.getElementById(config.formId),
		submit:          document.getElementById(config.submitId),
		resultContainer: document.getElementById(config.resultContainerId)
	};

	var Utils = {
		/**
		 * Add class to the DOM element
		 * @param  {Object} DOM element
		 * @param  {String} class
		 * @return {undefined}
		 */
		addClass: function (o, c) {
			var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");

			if (re.test(o.className)) {
				return;
			}

			o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
		},
		/**
		 * Remove class from the DOM element
		 * @param  {Object} DOM element
		 * @param  {String} class
		 * @return {undefined}
		 */
		removeClass: function (o, c) {
			var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");

			o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
		},
		/**
		 * Get an integer number in the range
		 * @param  {Number} minimal digit in the range
		 * @param  {Number} maximum digit in the range
		 * @return {Number} random digit in the range
		 */
		getRandomInt: function (min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
	};

	var _formHandler = {
		/**
		 * Init method
		 * @return {undefined}
		 */
		init: function () {
			this.handler();
		},
		/**
		 * Add submit handler for the form
		 * @return {undefined}
		 */
		handler: function () {
			cachedElements.form.addEventListener('submit', function (e) {
				e.preventDefault();

				MyForm.submit();
			});
		},
		/**
		 * Disable submit button
		 * @param  {Boolean} disabled value for submit button
		 * @return {undefined}
		 */
		disableSubmitButton: function (disabled) {
			cachedElements.submit.disabled = disabled;
		},
		/**
		 * Send data from the form to the server and handle response
		 * @return {undefined}
		 */
		sendData: function () {
			var data = MyForm.getData();
			var url = cachedElements.form.action;
			var _this = this;

			function makeRequest() {
				_this.request(data, url).then(function (response) {
					console.log('Response: ', response);

					_this.showResponse(response);

					if (response.status === config.statuses.PROGRESS) {
						setTimeout(makeRequest, response.timeout);
					}
				}).catch(function (response) {
					console.log('Failed request: ', response);

					_this.showResponse({ status: config.statuses.FAIL, url: url });
				});
			}

			makeRequest();

			console.log('Request data: ', data);
		},
		/**
		 * Show response from the server, add class to the #resultContainer
		 * @param  {Object} response object
		 * @return {undefined}
		 */
		showResponse: function (response) {
			cachedElements.resultContainer.className = config.classNames.resultContainer.default;

			if (response.status === config.statuses.SUCCESS) {
				cachedElements.resultContainer.innerHTML = "Success";

				Utils.addClass(cachedElements.resultContainer, config.classNames.resultContainer.success);
			} else if (response.status === config.statuses.ERROR) {
				cachedElements.resultContainer.innerHTML = response.reason;

				Utils.addClass(cachedElements.resultContainer, config.classNames.resultContainer.error);
			} else if (response.status === config.statuses.PROGRESS) {
				cachedElements.resultContainer.innerHTML = '&nbsp;';

				Utils.addClass(cachedElements.resultContainer, config.classNames.resultContainer.progress);
			} else if (response.status === config.statuses.FAIL) {
				cachedElements.resultContainer.innerHTML = 'Failed to fetch data from ' + response.url;

				Utils.addClass(cachedElements.resultContainer, config.classNames.resultContainer.fail);
			}

			if (response.status !== config.statuses.PROGRESS) {
				_formHandler.disableSubmitButton(false);
			}
		},
		/**
		 * Make request to the server
		 * @param  {Object} form`s data (I don`t send data to the real server)
		 * @param  {String} server`s url
		 * @return {Promise} promise with response
		 */
		request: function (data, url) {
			var fakeUrls = ['error.json', 'progress.json', 'success.json'];
			var _this = this;

			return fetch(url, {
				mode: "no-cors"
			}).then( function () {
				return _this.readExternalJson('https://raw.githubusercontent.com/serzilo/yaform/master/data/'+fakeUrls[Utils.getRandomInt(0 ,2)]);
			});
		},
		/**
		 * Get json from the remote server
		 * @param  {String} jsons`s url
		 * @return {Promise} promise with response
		 */
		readExternalJson: function (fileUrl) {
			return fetch(fileUrl)
				.then( function (response) {
					return response.json();
				});
		},
		/**
		 * Add error classes for invalid fields
		 * @param {Array} array with invalid fields
		 * @return {undefined}
		 */
		showFormErrors: function (data) {
			data.forEach(function (item) {
				var element = cachedElements.form[item];

				if (element) {
					Utils.addClass(element, config.classNames.input.error);
				}
			});

			console.log('Errors:', data);
		},
		/**
		 * Remove error classes from the fields
		 * @return {undefined}
		 */
		removeFormErrors: function () {
			for (var key in config.fields) {
				if (config.fields.hasOwnProperty(key)) {
					var element = cachedElements.form[key];

					if (element) {
						Utils.removeClass(element, config.classNames.input.error);
					}
				}
			}
		},
		validate: {
			/**
			 * Validation for fio field
			 * @param {String} field value
			 * @return {Boolean} is field valid
			 */
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
			/**
			 * Validation for email field
			 * @param {String} field value
			 * @return {Boolean} is field valid
			 */
			email: function (email) {
				var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
				var yaEmail = /@(ya\.ru|yandex\.ru|yandex\.ua|yandex\.by|yandex\.kz|yandex\.com)$/;

				if (!email.match(emailRegex) || !email.match(yaEmail)) {
					return false;
				}

				return true;
			},
			/**
			 * Validation for phone field
			 * @param {String} field value
			 * @return {Boolean} is field valid
			 */
			phone: function (phone) {
				var phoneRegex = /^\+7\(\d{3}\)\d{3}\-\d{2}\-\d{2}$/;

				if (!phone.match(phoneRegex)) {
					return false;
				}

				var phoneDigits = phone.replace(/\D/g, '');
				var sum = 0;
				var phoneDigitsString = phoneDigits.toString();
				var phoneDigitsStringLength = phoneDigitsString.length;

				for (var i = 0; i < phoneDigitsStringLength; i++) {
					sum += Number(phoneDigitsString[i]);
				}

				if (sum > config.maxPhoneDigitsSum) {
					console.log('Phone digits sum: ', sum);

					return false;
				}

				return true;
			}
		}
	};

	var MyForm = {
		/**
		 * Form validation
		 * @return {Object} object with validation results
		 */
		validate: function () {
			var results = {
				isValid: true,
				errorFields: []
			};

			var data = this.getData();

			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					var isValid = _formHandler.validate[config.fields[key].type](data[key]);

					if (isValid === false) {
						results.isValid = false;
						results.errorFields.push(key);
					}
				}
			}

			return results;
		},
		/**
		 * Get data from the form
		 * @return {Object} with form`s data
		 */
		getData: function () {
			var data = {};

			for (var key in config.fields) {
				if (config.fields.hasOwnProperty(key)) {
					var value = cachedElements.form[key].value;

					data[key] = value;
				}
			}

			return data;
		},
		/**
		 * Set data for the form
		 * @param {Object} object with data
		 * @return {undefined}
		 */
		setData: function (data) {
			if (data) {
				for (var key in config.fields) {
					if (config.fields.hasOwnProperty(key)) {
						var value = data[key];

						if (value !== undefined) {
							cachedElements.form[key].value = value;
						}
					}
				}
			} else {
				console.error('setData: wrong data');
			}
		},
		/**
		 * Submit form
		 * @return {undefined}
		 */
		submit: function () {
			_formHandler.disableSubmitButton(true);

			_formHandler.removeFormErrors();

			var validateForm = this.validate();
			
			if (validateForm.isValid === true) {
				_formHandler.sendData();
			} else {
				_formHandler.showFormErrors(validateForm.errorFields);

				_formHandler.disableSubmitButton(false);
			}
		}
	};

	_formHandler.init();

	// export MyForm to global
	window.MyForm = MyForm;

})(window, document);
