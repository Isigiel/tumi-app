import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApplicationState, User } from '@tumi/models';
import { allTypes, IconToastComponent } from '@tumi/modules/shared';
import {
  AuthService,
  Country,
  CountryService,
  UserService,
} from '@tumi/services';
import { ApplicationService } from '@tumi/services/application.service';
import { endOfMonth, subYears } from 'date-fns/esm';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-new-member-page',
  templateUrl: './new-member-page.component.html',
  styleUrls: ['./new-member-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewMemberPageComponent implements OnInit {
  public applicationForm: FormGroup;
  public countries$: Observable<Country[]>;
  public hasApplication$: Observable<boolean>;
  public types = allTypes;
  public maxBirthday = subYears(new Date(), 15);
  public minGraduation = new Date();
  private user$: Observable<User>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private countries: CountryService,
    private router: Router,
    private users: UserService,
    private toast: MatSnackBar,
    private applications: ApplicationService
  ) {}

  get languages(): FormArray {
    return this.applicationForm.get('languages') as FormArray;
  }

  async ngOnInit(): Promise<void> {
    this.applicationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      country: ['', Validators.required],
      birthday: [null, Validators.required],
      studyField: ['', Validators.required],
      studyLevel: ['', Validators.required],
      studySemester: ['', Validators.required],
      graduation: [null, Validators.required],
      languages: this.fb.array([
        this.fb.group({
          language: 'German',
          level: [''],
        }),
        this.fb.group({
          language: 'English',
          level: [''],
        }),
      ]),
      experienceAbroad: [''],
      experienceVolunteering: [''],
      motivation: [''],
      referrer: [''],
    });
    this.applicationForm.get('languages.0.language')?.disable();
    this.applicationForm.get('languages.1.language')?.disable();
    this.countries$ = this.countries.getAll();
    this.user$ = this.auth.user$;
    const user = await this.user$.pipe(first()).toPromise();
    this.hasApplication$ = this.applications.userHasNewMemberApplication(
      user.id
    );
    this.applicationForm.patchValue(user);
    const inProgress = localStorage.getItem('applicationDraft');
    if (inProgress) {
      try {
        const application = JSON.parse(inProgress);
        this.applicationForm.patchValue({
          ...application,
          birthday: new Date(application.birthday),
          graduation: new Date(application.graduation),
        });
      } catch (e) {
        console.log(e);
      }
    }
    this.applicationForm.valueChanges.subscribe((value) =>
      localStorage.setItem('applicationDraft', JSON.stringify(value))
    );
  }

  public chosenMonthHandler(
    normalizedMonth: Date,
    datepicker: MatDatepicker<any>
  ): void {
    this.applicationForm
      .get('graduation')
      ?.patchValue(endOfMonth(normalizedMonth));
    datepicker.close();
  }

  public addLanguage(): void {
    this.languages.push(
      this.fb.group({
        language: [''],
        level: [''],
      })
    );
  }

  public async submitApplication(): Promise<void> {
    const data = this.applicationForm.getRawValue();
    const user = await this.auth.user$.pipe(first()).toPromise();
    data.userId = user.id;
    data.created = new Date();
    data.state = ApplicationState.Submitted;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.phone = data.phone;
    user.country = data.country;
    user.birthday = data.birthday;
    user.email = data.email;
    await this.users.update(user.id, user);
    await this.applications.addNewMember(data);
    this.toast.openFromComponent<IconToastComponent>(IconToastComponent, {
      data: {
        message: 'Application was successfully submitted!',
        icon: 'icon-checkmark',
      },
    });
    await this.router.navigateByUrl('/apply/submitted');
  }
}
