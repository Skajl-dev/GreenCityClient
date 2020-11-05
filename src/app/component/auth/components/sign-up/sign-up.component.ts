import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService, GoogleLoginProvider } from 'angularx-social-login';
import { authImages } from 'src/app/image-pathes/auth-images';
import { ConfirmPasswordValidator, ValidatorRegExp } from './sign-up.validator';
import { GoogleSignInService } from '@global-service/auth/google-sign-in.service';
import { SubmitEmailComponent } from '../submit-email/submit-email.component';
import { UserOwnSignInService } from '@global-service/auth/user-own-sign-in.service';
import { UserOwnSignUpService } from '@global-service/auth/user-own-sign-up.service';
import { UserOwnSignUp } from '@global-models/user-own-sign-up';
import { UserSuccessSignIn, SuccessSignUpDto } from '@global-models/user-success-sign-in';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  public signUpForm: FormGroup;
  public emailControl: AbstractControl;
  public firstNameControl: AbstractControl;
  public passwordControl: AbstractControl;
  public passwordControlConfirm: AbstractControl;
  public signUpImages = authImages;
  public userOwnSignUp: UserOwnSignUp;
  public loadingAnim = false;
  public isEmailInvalid = false;
  public emailErrorMessageBackEnd: string;
  public passwordErrorMessageBackEnd: string;
  public firstNameErrorMessageBackEnd: string;
  public passwordConfirmErrorMessageBackEnd: string;
  public backEndError: string;
  @Output() private pageName = new EventEmitter();

  constructor(private  matDialogRef: MatDialogRef<SignUpComponent>,
              private dialog: MatDialog,
              private formBuilder: FormBuilder,
              private userOwnSignInService: UserOwnSignInService,
              private userOwnSecurityService: UserOwnSignUpService,
              private router: Router,
              private authService: AuthService,
              private googleService: GoogleSignInService,
              ) { }

  ngOnInit() {
    this.onFormInit();
    this.getFormFields();
    this.setNullAllMessage();
    this.userOwnSignUp = new UserOwnSignUp();
  }

  public onSubmit(userOwnRegister: UserOwnSignUp): void {
    const { email, firstName, password } = this.signUpForm.value;

    userOwnRegister.email = email;
    userOwnRegister.firstName = firstName;
    userOwnRegister.password = password;

    this.setNullAllMessage();
    this.loadingAnim = true;
    this.userOwnSecurityService.signUp(userOwnRegister)
      .subscribe(
        (data: SuccessSignUpDto) => {
          this.onSubmitSuccess(data);
        }, (error: HttpErrorResponse) => {
          this.onSubmitError(error);
        });
  }

  public signUpWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((data) => {
        this.googleService.signIn(data.idToken)
          .subscribe((successData) => this.signUpWithGoogleSuccess(successData));
      })
      .catch((errorData) => this.signUpWithGoogleError(errorData));
  }

  public setEmailBackendErr(): void {
    this.emailErrorMessageBackEnd = null;
  }

  public setPasswordVisibility(htmlInput: HTMLInputElement, htmlImage: HTMLImageElement): void {
    htmlInput.type = htmlInput.type === 'password' ? 'text' : 'password';
    htmlImage.src = htmlInput.type === 'password' ? this.signUpImages.hiddenEye : this.signUpImages.openEye;
  }

  public openSignInWindow(): void {
    this.pageName.emit('sign-in');
  }

  private onFormInit(): void {
    this.signUpForm = this.formBuilder.group({
        email: ['', [ Validators.required, Validators.email ]],
        firstName: ['', [ Validators.required ]],
        password: ['', [ Validators.required ]],
        repeatPassword: ['', [ Validators.required ]]
      },
      {
        validator: [
          ConfirmPasswordValidator('password', 'repeatPassword'),
          ValidatorRegExp('firstName'),
          ValidatorRegExp('password'),
        ]
      }
    );
  }

  private getFormFields(): void {
    this.emailControl = this.signUpForm.get('email');
    this.firstNameControl = this.signUpForm.get('firstName');
    this.passwordControl = this.signUpForm.get('password');
    this.passwordControlConfirm = this.signUpForm.get('repeatPassword');
  }

  private setNullAllMessage(): void {
    this.firstNameErrorMessageBackEnd = null;
    this.emailErrorMessageBackEnd = null;
    this.passwordErrorMessageBackEnd = null;
    this.passwordConfirmErrorMessageBackEnd = null;
  }

  private onSubmitSuccess(data: SuccessSignUpDto): void {
    this.loadingAnim = false;
    this.openSignUpPopup();
    this.closeSignUpWindow();
    this.receiveUserId(data.userId);
  }

  private openSignUpPopup(): void {
    this.dialog.open(SubmitEmailComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: false,
      panelClass: 'custom-dialog-container',
    });
  }

  private closeSignUpWindow(): void {
    this.matDialogRef.close();
  }

  private receiveUserId(id: number): void {
    setTimeout(() => {
      this.router.navigate(['/welcome']);
      this.dialog.closeAll();
    }, 5000);
  }

  private onSubmitError(errors: HttpErrorResponse): void {
    errors.error.map(error => {
      switch (error.name) {
        case 'name':
          this.firstNameErrorMessageBackEnd = error.message;
          break;
        case 'email':
          this.emailErrorMessageBackEnd = error.message;
          this.isEmailInvalid = this.emailErrorMessageBackEnd === 'The email is invalid';
          break;
        case 'password':
          this.passwordErrorMessageBackEnd = error.message;
          break;
        case 'passwordConfirm':
          this.passwordConfirmErrorMessageBackEnd = error.message;
          break;
      }
    });
    this.loadingAnim = false;
  }

  private signUpWithGoogleSuccess(data: UserSuccessSignIn): void {
    this.userOwnSignInService.saveUserToLocalStorage(data);
    this.closeSignUpWindow();
    this.router.navigate(['/']);
  }

  private signUpWithGoogleError(errors: HttpErrorResponse): void {
    if (!Array.isArray(errors.error)) {
      this.backEndError = errors.error.message;
      return;
    }

    errors.error.map((error) => {
      this.emailErrorMessageBackEnd = error.name === 'email' ? error.message : this.emailErrorMessageBackEnd;
      this.passwordConfirmErrorMessageBackEnd = error.name === 'password' ? error.message : this.passwordConfirmErrorMessageBackEnd;
    });
  }
}
