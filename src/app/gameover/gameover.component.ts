import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-gameover',
  templateUrl: './gameover.component.html',
  styleUrls: ['./gameover.component.css']
})
export class GameOverComponent implements OnInit {

  public remainingTime = 0;
  public currentScore = 0;
  public timelost = 0;

  constructor(
    private dialogRef: MatDialogRef<GameOverComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

      this.currentScore = data.bulbs;
      this.remainingTime = data.time;
      this.timelost = data.timelost;
      
  }

  ngOnInit() {
  }

  continue() {
    this.dialogRef.close();
  }

  endGame() {
    this.dialogRef.close(false);
  }

}
