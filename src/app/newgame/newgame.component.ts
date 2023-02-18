import { Component, OnInit, Inject, InjectionToken, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface DialogData {
  name: string;  
  numMinimo: number;
  tiempo: number;
  penalizacion: number;
}

@Component({
  selector: 'newgame',
  templateUrl: 'newgame.component.html',
  styleUrls: ['newgame.component.css']
})
export class NewGameComponent implements OnInit {

  form: FormGroup;
  @Input() numMinimo: number;
  @Input() tiempo: number
  @Input() penalizacion: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewGameComponent>) {
    this.form = fb.group({
      name: ["", Validators.required]      
    });
    this.numMinimo = data.numMinimo;
    this.tiempo = data.tiempo;
    this.penalizacion = data.penalizacion;
  }

  ngOnInit() {
    let player = localStorage.getItem('player');    
    if (player) {
      this.form.value.name = player;      
    }
  }

  save() {
    const { value, valid } = this.form;
    if (valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }

  validateForm(): any {
    if (this.form.value.name != "") {
      localStorage.setItem('player', this.form.value.name);      
      return true;
    } else {
      return false;
    }
  }

}


