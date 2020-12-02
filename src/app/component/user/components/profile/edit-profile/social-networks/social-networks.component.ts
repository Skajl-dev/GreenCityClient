import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-social-networks',
  templateUrl: './social-networks.component.html',
  styleUrls: ['./social-networks.component.scss']
})
export class SocialNetworksComponent implements OnInit {
  public icons = {
    edit: './assets/img/profile/icons/edit.svg',
    add: './assets/img/profile/icons/add.svg',
    delete: './assets/img/profile/icons/delete.svg',
    defaultIcon: './assets/img/profile/icons/default_social.svg'
  };

  public urlValidationRegex = /^(https?):\/\/(-\.)?([^\s\/?\.#]+\.?)+(\/[^\s]*)?$/i;
  public showInput = false;
  public inputTextValue;
  public editedSocialLink: any = false;

  @ViewChild('socialLink', {static: false}) socialLink: NgModel;
  @Input() socialNetworks = [];
  @Output() socialNetworksChange: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  public onEditLink(link): void {
    this.onToggleInput(true);
    this.inputTextValue = link.url;
    this.editedSocialLink = link.url;
    this.onDeleteLink(link);
  }

  public onDeleteLink(link): void {
    this.socialNetworks = this.socialNetworks.filter(el => link.url !== el.url );
    this.onEmitSocialNetworksChange();
  }

  public onToggleInput(state?: boolean): void {
    if ( arguments.length > 0 ) {
      this.showInput = state;
    } else {
      this.showInput = !this.showInput;
    }
  }

  public getSocialImage(socialNetwork) {
    return socialNetwork && socialNetwork.socialNetworkImage && socialNetwork.socialNetworkImage.imagePath === '' ?
            this.icons.defaultIcon
            : socialNetwork.socialNetworkImage.imagePath;
  }

  public onCloseForm(): void {
    if ( this.editedSocialLink ) {
      this.onAddLink(this.editedSocialLink);
      this.editedSocialLink = false;
    }
    this.onToggleInput(false);
    this.inputTextValue = '';
  }

  public getErrorMessage(linkErrors) {
    let result = 'user.edit-profile.input-validation-';
    Object.keys(linkErrors).map(error => {
      return result = result + error;
    });
    return result;
  }

  public onAddLink(link?) {
    const value = link || this.inputTextValue;

    if ( this.checkIsUrl(value) && !this.onCheckForExisting(value) ) {
      this.socialNetworks.push({
        url: value,
        socialNetworkImage: {
          imagePath: this.icons.defaultIcon
        }
      });
      this.onEmitSocialNetworksChange();
      this.editedSocialLink = false;
      this.onCloseForm();
    } else {
      // set error to input if user have same link added
      return this.socialLink.control.setErrors({'non-unique': true});
    }
  }

  public replaceHttp(str: string) {
    return str.replace(/(https|http):\/\//i, '');
  }

  private onEmitSocialNetworksChange(): void {
    this.socialNetworksChange.emit(this.createArrayWithUrl());
  }

  private checkIsUrl(url: string) {
    return this.urlValidationRegex.test(url);
  }

  private onCheckForExisting(url: string) {
    return this.socialNetworks.some(el => url === el.url);
  }

  private createArrayWithUrl(arr = this.socialNetworks) {
    const result = [];
    Object.values(arr).map(el => result.push(el.url));
    return result;
  }
}
