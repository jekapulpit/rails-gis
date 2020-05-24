import { validationMixin } from 'vuelidate'
import {
  required,
  email,
  minLength,
  maxLength,
} from 'vuelidate/lib/validators'
import axios from 'axios';
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

export default {
  name: "registration",
  mixins: [validationMixin],
  data: () => ({
    form: {
      login: null,
      password: null,
      firstName: null,
      lastName: null,
      email: null,
    },
    userSaved: false,
    sending: false,
    lastUser: null
  }),
  validations: {
    form: {
      login: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(15),
      },
      password: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(15),
      },
      firstName: {
        required,
        minLength: minLength(2),
        maxLength: maxLength(15),
      },
      lastName: {
        required,
        minLength: minLength(2),
        maxLength: maxLength(15),
      },
      email: {
        required,
        email,
        maxLength: maxLength(25),
}
    }
  },
  methods: {
    getValidationClass (fieldName) {
      const field = this.$v.form[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    clearForm () {
      this.$v.$reset();
      this.form.login = null;
      this.form.password = null;
      this.form.firstName = null;
      this.form.lastName = null;
      this.form.email = null;
    },
    saveUser () {
      this.sending = true;
      const user = {...this.form};
      axios
        .post(`http://nuolh.belstu.by:8088/user/add`,user)
        .then(res => {
        }).catch(() => {
        });

      // Instead of this timeout, here you can call your API
      window.setTimeout(() => {
        this.lastUser = `${this.form.firstName} ${this.form.lastName}`;
        this.userSaved = true;
        this.sending = false;
        this.clearForm()
      }, 1500)
    },
    validateUser () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.saveUser()
      }
    }
  }
}
