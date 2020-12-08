import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { Observable, of, Subject} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SearchModel } from '../../model/search/search.model';
import { SearchDto } from 'src/app/component/layout/components/models/search-dto';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:3000';
  private backEndLink = environment.backendLink;
  private allElemsSubj = new Subject<any>();
  public searchSubject = new Subject<boolean>();
  public allSearchSubject = new Subject<boolean>();
  public allElements: SearchDto;

  public getSearch(searchQuery: string): Observable<SearchModel> {
    return this.http.get<SearchModel>(`${this.backEndLink}search?searchQuery=${searchQuery}`).pipe(
      switchMap(res => of(res))
    );
  }

  public getAllSearch(searchQuery: string, searchType: string): Observable<SearchModel> {
    switch (searchType) {
      case 'relevance': {
        this.getResultsByCat('search');
        break;
      }
      case 'newest': {
        this.getResultsByCat('newest');
        break;
      }
      case 'latest': {
        this.getResultsByCat('noresults');
        break;
      }
      default: {
        return this.getResultsByCat('search');
      }
    }
  }

  private getResultsByCat(searchType: string): Observable<SearchModel> {
    return this.http.get<SearchModel>(`${this.apiUrl}/${searchType}`).pipe(
      switchMap(res => of(res))
    );
  }

  public toggleSearchModal() {
    this.searchSubject.next(true);
  }

  public closeSearchSignal() {
    this.searchSubject.next(false);
  }

  public toggleAllSearch(value) {
    this.allSearchSubject.next(value);
  }

  public getAllResults(query: string, category: string = 'econews', page: number = 0, sort: string = '') {
    const itemsPerPage = 9;

    // bug on backend in DB
    if (category === 'tipsandtricks') {
      sort.replace('creation_date', 'creationDate');
    }

    return this.http.get(`${this.backEndLink}search/${category}?searchQuery=${query}&sort=${sort}&page=${page}&size=${itemsPerPage}`)
    .pipe(
      switchMap(res => of(res))
    );
  }

  public getElementsAsObserv(): Observable<any> {
    return this.allElemsSubj.asObservable();
  }

  constructor(private http: HttpClient) { }
}
