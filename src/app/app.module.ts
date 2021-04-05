import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material';
import { MatSliderModule } from '@angular/material/slider'
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AppComponent } from './app.component';
import { BestScoreManager } from './app.storage.service';
import { GameOverComponent } from './gameover/gameover.component';
import { NewGameComponent } from './newgame/newgame.component';


@NgModule({
  declarations: [
    AppComponent,
    NewGameComponent,
    GameOverComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
    MatButtonModule,
    MatDialogModule,    
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatSliderModule,
    MatSlideToggleModule    
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
