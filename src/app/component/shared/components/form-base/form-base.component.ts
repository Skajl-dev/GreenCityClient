import { Component, HostListener, OnInit } from '@angular/core';
import { ComponentCanDeactivate } from '@global-service/pending-changes-guard/pending-changes.guard';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { WarningPopUpComponent } from '@shared/components';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-form-base',
  templateUrl: './form-base.component.html',
  styleUrls: ['./form-base.component.scss']
})
export class FormBaseComponent implements ComponentCanDeactivate {

  public areChangesSaved = false;
  public previousPath = '';
  public popupConfig = {
    hasBackdrop: true,
    closeOnNavigation: true,
    disableClose: true,
    panelClass: '',
    data: {
      popupTitle: '',
      popupSubtitle: '',
      popupConfirm: '',
      popupCancel: ''
    }
  };

  constructor(public router: Router,
              public dialog: MatDialog) { }

  @HostListener('window:beforeunload', ['$event'])

  public cancel(path): void {
    if (this.checkChanges()) {
      const matDialogRef = this.dialog.open(WarningPopUpComponent, this.popupConfig);

      const dialogSub = matDialogRef.afterClosed().subscribe(confirm => {
        if (confirm) {
          this.areChangesSaved = true;
          this.router.navigate([path]);
        }
        dialogSub.unsubscribe();
      });
    } else {
      this.areChangesSaved = true;
      this.router.navigate([path]);
    }
  }

  public checkChanges(): any { }

  canDeactivate(): boolean | Observable<boolean> {
    return this.areChangesSaved ? true : !this.checkChanges();
  }
}
