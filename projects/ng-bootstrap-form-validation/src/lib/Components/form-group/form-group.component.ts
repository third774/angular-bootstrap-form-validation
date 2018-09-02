import {
  Component,
  OnInit,
  AfterContentInit,
  ContentChildren,
  QueryList,
  Input,
  HostBinding,
  ContentChild,
  ElementRef
} from "@angular/core";
import { FormControlName } from "@angular/forms";
import { MessagesComponent } from "../messages";
import { ErrorMessage } from "../../Models";
import { ErrorMessageService } from "../../Services";

@Component({
  // tslint:disable-next-line:component-selector
  selector: ".form-group",
  template: `
  <ng-content></ng-content>
  <bfv-messages *ngIf="!messagesBlock" [messages]="messages"></bfv-messages>
`
})
export class FormGroupComponent implements OnInit, AfterContentInit {
  @ContentChildren(FormControlName)
  FormControlNames: QueryList<FormControlName>;

  @Input()
  customErrorMessages: ErrorMessage[] = [];

  @Input()
  validationDisabled = false;

  @HostBinding("class.has-error")
  get hasErrors() {
    return (
      this.FormControlNames.some(c => !c.valid && c.dirty && c.touched) &&
      !this.validationDisabled
    );
  }

  @HostBinding("class.has-success")
  get hasSuccess() {
    return (
      !this.FormControlNames.some(c => !c.valid) &&
      this.FormControlNames.some(c => c.dirty && c.touched) &&
      !this.validationDisabled
    );
  }

  @ContentChild(MessagesComponent)
  public messagesBlock: MessagesComponent;

  private errorMessages: ErrorMessage[];

  public messages = () => this.getMessages();

  constructor(
    private elRef: ElementRef,
    private errorMessageService: ErrorMessageService
  ) {}

  ngAfterContentInit() {
    if (this.messagesBlock) {
      this.messagesBlock.messages = this.messages;
    }
  }

  ngOnInit() {
    this.errorMessages = this.errorMessageService.errorMessages
      .concat(this.customErrorMessages)
      .reverse();
  }

  get label() {
    const label = this.elRef.nativeElement.querySelector("label");
    return label && label.textContent ? label.textContent.trim() : "This field";
  }

  get isDirtyAndTouched() {
    return this.FormControlNames.some(c => c.dirty && c.touched);
  }

  private getMessages(): string[] {
    const messages = [];
    if (!this.isDirtyAndTouched || this.validationDisabled) {
      return messages;
    }

    const names = this.FormControlNames.map(f => f.name);

    this.FormControlNames.filter(
      (c, i) =>
        !c.valid &&
        !!c.errors &&
        // filter out FormControlNames that share the same name - usually for radio buttons
        names.indexOf(c.name) === i
    ).forEach(control => {
      Object.keys(control.errors).forEach(key => {
        const error = this.errorMessages.find(err => err.error === key);
        if (!error) {
          return;
        }
        messages.push(error.format(this.label, control.errors[key]));
      });
    });

    return messages;
  }
}
