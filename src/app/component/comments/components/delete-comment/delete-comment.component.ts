import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { CommentsDTO } from '../../models/comments-model';
import { WarningPopUpComponent } from '@shared/components/warning-pop-up/warning-pop-up.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-delete-comment',
  templateUrl: './delete-comment.component.html',
  styleUrls: ['./delete-comment.component.scss']
})
export class DeleteCommentComponent {
  @Input() public element: CommentsDTO;
  @Input() public dataType: string;
  @Output() public elementsList = new EventEmitter();
  public deleteIcon = 'assets/img/comments/delete.png';

  constructor(private commentsService: CommentsService,
              private dialog: MatDialog) { }

  private openPopup(): void {
    const dialogRef = this.dialog.open(WarningPopUpComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'popup-dialog-container',
      data: {
        popupTitle: `homepage.eco-news.comment.${this.dataType}-popup.title`,
        popupConfirm: `homepage.eco-news.comment.${this.dataType}-popup.confirm`,
        popupCancel: `homepage.eco-news.comment.${this.dataType}-popup.cancel`,
      }
    });

    const subscribeDialog = dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.commentsService.deleteComments(this.element.id).subscribe(response => {
          if (response.status === 200) {
            this.elementsList.emit();
          }
        });
      }
      subscribeDialog.unsubscribe();
    });
  }
}
