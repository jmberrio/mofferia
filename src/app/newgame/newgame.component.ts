import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  team: string;
  name: string;
}

@Component({
  selector: 'newgame',
  templateUrl: 'newgame.component.html',
  styleUrls: ['newgame.component.css']
})
export class NewGameComponent implements OnInit {

  form: FormGroup;

  constructor(    
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewGameComponent>) {

      this.form = fb.group({
        team: ["", Validators.required],
        name: ["", Validators.required]
      });
    }
  
    ngOnInit() { 
      let player = localStorage.getItem('player');
      let team = localStorage.getItem('team')
      if (player && team) {
        this.form.value.name = player;
        this.form.value.team = team;
      }
     }

    save() {
      const {value, valid} = this.form;
      if (valid){
        this.dialogRef.close(this.form.value);
      }
    }

    close() {
      this.dialogRef.close();
    }

    validateForm() : any {
      if (this.form.value.team != "" && this.form.value.name != "") {
        localStorage.setItem('player', this.form.value.name);
        localStorage.setItem('team', this.form.value.team);
        return true;
      } else return false;
    }

}


