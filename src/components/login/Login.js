import {validationMixin} from 'vuelidate'
import {
  required,
  minLength,
} from 'vuelidate/lib/validators'

export default {
  name: 'Login',
  mixins: [validationMixin],
  data: () => ({
    form: {
      login: null,
      lastName: null
    },
    userSaved: false,
    sending: false,
    lastUser: null
  }),
  validations: {
    form: {
      login: {
        required,
        minLength: minLength(3)
      },
      lastName: {
        required,
        minLength: minLength(3)
      }
    }
  },
  methods: {
    goToRegistration: function () {
      this.$router.push({path: 'registration'})
    },
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    clearForm() {
      this.$v.$reset();
      this.form.login = null;
      this.form.lastName = null;
    },
    saveUser() {
      this.sending = true;
      window.setTimeout(() => {
        this.lastUser = `${this.form.login} ${this.form.lastName}`
        this.userSaved = true;
        this.sending = false;
        this.clearForm()
      }, 2500)
    },
    validateUser() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.saveUser();
      }
    }
  }
};
