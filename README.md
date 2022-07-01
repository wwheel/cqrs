## Description
<p>
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  </a>
</p>
A lightweight **CQRS** module for [Angular](https://angular.io) framework. Action handler and query handler module are loaded with lazy-load at the moment of action or query call. Action handler and query handler are Angular modules and can use Angular libraries in dependencies. Just `1.6kb` minified and gzipped.

## Installation

```bash
$ npm install --save @waterwheel/cqrs
```

## src/app/app.module.ts 

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';
 
import { AppComponent } from './app.component';
 
import { CqrsModule } from 'cqrs';
 
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CqrsModule.forRoot({
          sagas   : [HeroesGameSagas],
          registry: [
            {
                impl   : KillDragonAction,
                handler: () => import('./actions/kill-dragon/kill-dragon.handler').then(mod => mod.KillDragonHandler)
            }
          ]
        })
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Actions
In this model, each action is called a Action. When a action is sent, the application responds to it. 
Let's create for example a `ShowNotificationAction` action to display notifications. Let's see how the action looks:

```typescript
export class ShowNotificationAction
{
    static readonly type = 'ShowNotificationAction';

    constructor(
        public readonly type: string,
        public readonly text: string,
    )
    {
    }
}
```

The `ActionBus` is a stream of actions. It delegates actions to the equivalent handlers. Each action must have an appropriate action handler:

```typescript
@NgModule()
export class ShowNotificationHandler implements IActionHandler<ShowNotificationAction>
{
    constructor(private readonly actionBus: ActionBus)
    {
    }

    async execute(action: ShowNotificationAction)
    {
        // Load PNotify script
        await this.actionBus.execute(new LoadScriptsAction('pnotify'));
        
        // Show notice
        new PNotify({
            text       : action.text,
            icon       : false,
            buttons    : {
                closer : true,
                sticker: false
            });
    }
}
```
All actions and queries work like Angular modules and are loaded with lazy-load at the time of a command or request.
With this method of work, each change in the application is determined by the appearance of the action. The logic is encapsulated in handlers.

```typescript
constructor(private readonly actionBus: ActionBus)
{
    this.actionBus.execute(new ShowNotificationAction('success', 'Ok'))
}
```

## Queries

The `QueryBus` follows the same pattern as the `ActionsBus`. Let's create for example a `GetMoviesQuery` query:

Query:
```typescript
export class GetMoviesQuery {
    static readonly type = 'GetMoviesQuery';
    
    constructor(
      public readonly isSearch: boolean,
      public readonly searchValue: string
    ) {}
}
```
Query Handler:
```typescript
@NgModule()
export class GetMoviesHandler implements IQueryHandler<GetMoviesQuery>
{
    private readonly API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1';
    private readonly SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query="';

    async execute(query: GetMoviesQuery): Promise<Element>
    {
        const response = await fetch(query.isSearch ? this.SEARCH_API + query.searchValue : this.API_URL);
        return response.json();
    }
}
```
Request example:
```typescript
async getMovies()
{
    const value = await this.queryBus.execute(new GetMoviesQuery(true, 'sonic'))
}
```

## Sagas

Sagas are an extremely powerful feature. A single saga may listen for 1..* actions. Using the RxJS library, it can combine, merge, filter or apply other RxJS operators on the event stream. Each saga returns an Observable which contains a action. This action is dispatched asynchronously.

```typescript
@Injectable()
export class HeroesGameSagas {
  @Saga()
  dragonKilled = (events$: Observable<any>): Observable<IAction> => {
    return events$.pipe(
      ofType(KillDragonAction),
      map((event) => new DropAncientItemAction(event.heroId)),
    );
  }
}
```

A working example is available in `src/app`.
