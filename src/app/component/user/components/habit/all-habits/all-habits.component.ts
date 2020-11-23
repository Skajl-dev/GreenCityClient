import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ServerHabitItemPageModel } from '@global-user/models/habit-item.model';
import { AllHabitsService } from './services/all-habits.service';

@Component({
  selector: 'app-all-habits',
  templateUrl: './all-habits.component.html',
  styleUrls: ['./all-habits.component.scss']
})
export class AllHabitsComponent implements OnInit, OnDestroy {

  public filteredHabitsList: ServerHabitItemPageModel[] = [];
  public totalHabits: number;
  public totalHabitsCopy = 0;
  public galleryView = true;
  public isFetching = true;
  public elementsLeft = true;
  public tagList: string[] = [];
  public windowSize: number;
  private currentPage = 0;
  private totalPages: number;
  private masterSubscription: Subscription = new Subscription();
  private habitsList: ServerHabitItemPageModel[] = [];
  private lang: string;
  private batchSize = 6;

  constructor( private allHabitsService: AllHabitsService,
               private localStorageService: LocalStorageService,
               private translate: TranslateService ) { }

  ngOnInit() {
    this.onResize();

    const langChangeSub = this.localStorageService.languageBehaviourSubject.subscribe(lang => {
      this.translate.setDefaultLang(lang);
      this.lang = lang;
      this.resetState();
      this.allHabitsService.resetSubject();
      this.getAllHabits(0, this.batchSize, lang);
    });

    const habitServeceSub = this.allHabitsService.allHabits.subscribe(data => {
      this.isFetching = false;
      this.totalHabits = data.totalElements;
      this.totalHabitsCopy = data.totalElements;
      this.totalPages = data.totalPages;
      this.currentPage = data.currentPage;
      this.habitsList = data.page;
      this.filteredHabitsList = data.page;

      let tag = [];
      if (data.page) {
        this.elementsLeft = data.totalElements !== this.habitsList.length;

        data.page.forEach(element => {
          return tag = [...tag, ...element.habitTranslation.habitItem];
        });
        this.tagList = [...new Set(tag)];
      }
    });

    this.masterSubscription.add(langChangeSub);
    this.masterSubscription.add(habitServeceSub);
  }

  ngOnDestroy(): void {
    this.masterSubscription.unsubscribe();
  }

  public onDisplayModeChange(mode: boolean): void {
    this.galleryView = mode;
  }

  public getFilterData(event: Array<string>) {
    if (event.length === 0) {
      this.totalHabitsCopy = this.totalHabits;
      return this.filteredHabitsList = this.habitsList;
    }
    if (this.filteredHabitsList.length > 0) {
      this.filteredHabitsList = this.habitsList.filter(el => {
        return el.habitTranslation.habitItem.find(item => {
          return event.includes(item);
        });
      });
      this.onScroll();
      this.totalHabitsCopy = this.filteredHabitsList.length;
    }
  }

  public onResize(): void {
    this.windowSize = window.innerWidth;
    this.galleryView = (this.windowSize >= 576) ? this.galleryView : true;
  }

  public onScroll() {
    if (this.totalPages === this.currentPage) {
      this.isFetching = false;
      return;
    }
    this.isFetching = true;
    this.currentPage += 1;
    this.getAllHabits(this.currentPage, this.batchSize, this.lang);
  }

  private getAllHabits(page: number, size: number, lang: string): void {
    this.allHabitsService.fetchAllHabits(page, size, lang);
  }

  private resetState() {
    this.isFetching = true;
    this.currentPage = 0;
    this.elementsLeft = true;
  }
}
