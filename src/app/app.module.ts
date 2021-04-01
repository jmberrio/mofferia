import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NewGameComponent } from './newgame/newgame.component';
import { BestScoreManager } from './app.storage.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatInputModule } from '@angular/material';
import { OverlayModule } from '@angular/cdk/overlay';
import { GameOverComponent } from './gameover/gameover.component';


@NgModule({
  declarations: [
    AppComponent,
    NewGameComponent,
    GameOverComponent
  ],
  imports: [
    BrowserModule,
    OverlayModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  providers: [
    BestScoreManager,
    MatDialog
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    NewGameComponent,
    GameOverComponent
  ]
})
export class AppModule { }
