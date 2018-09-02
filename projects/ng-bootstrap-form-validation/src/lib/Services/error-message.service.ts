import { Injectable, Inject } from "@angular/core";
import { DEFAULT_ERRORS } from "../default-errors";
import { CUSTOM_ERROR_MESSAGES, BOOTSTRAP_VERSION } from "../Tokens/tokens";
import { ErrorMessage } from "../Models";

@Injectable({
  providedIn: "root"
})
export class ErrorMessageService {
  private defaultErrors = DEFAULT_ERRORS;

  public errorMessages: ErrorMessage[];

  constructor(
    @Inject(CUSTOM_ERROR_MESSAGES) public customErrorMessages: ErrorMessage[][]
  ) {
    this.errorMessages = customErrorMessages.reduce(
      (acc, cur) => acc.concat(cur),
      this.defaultErrors
    );
  }
}
