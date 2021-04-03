import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-gameover',
  templateUrl: './gameover.component.html',
  styleUrls: ['./gameover.component.css']
})
export class GameOverComponent implements OnInit {

  private remainingTime = 0;
  private currentScore = 0;

  constructor(
    private dialogRef: MatDialogRef<GameOverComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

      this.currentScore = data.bulbs;
      this.remainingTime = data.time;
      
  }

  ngOnInit() {
  }

  continue() {
    this.dialogRef.close();
  }

  endGama() {
    this.dialogRef.close(false);
  }

}