import { Component, OnInit, group } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form: FormGroup;
  message;
  messageClass;
  processing = false;
  emailValid;
  emailMessage;
  usernameValid;
  usernameMessage;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(30),
        this.validateEmail
      ])],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirm: ['', Validators.required]
    }, {validator: this.matchingPasswords('password', 'confirm')});
  }

  disableForm() {
    this.form.get('email').disable();
    this.form.get('username').disable();
    this.form.get('password').disable();
    this.form.get('confirm').disable();
  }

  enableForm() {
    this.form.get('email').enable();
    this.form.get('username').enable();
    this.form.get('password').enable();
    this.form.get('confirm').enable();
  }

  validateEmail(controls) {
    const regExp = new
    // tslint:disable-next-line:max-line-length
    RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
    if (regExp.test(controls.value)) {
      return null;
    } else {
      return {'validateEmail': true};
    }
  }

  matchingPasswords(password, confirm) {
    // tslint:disable-next-line:no-shadowed-variable
    return ( group: FormGroup) => {
      if (group.controls[password].value === group.controls[confirm].value) {
        return null;
      } else {
        return {'matchingPasswords': true};
      }
    };
  }

  onReg() {
    this.processing = true;
    this.disableForm();
    const user = {
      email : this.form.get('email').value,
      username: this.form.get('username').value,
      password: this.form.get('password').value
    };

    this.authService.regUser(user).subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger',
        this.message = data.message;
        this.processing = false;
        this.enableForm();
      } else {
        this.messageClass = 'alert alert-success',
        this.message = data.message;
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      }
    });
  }

  ngOnInit() {
  }

}
