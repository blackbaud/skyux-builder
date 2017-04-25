export abstract class SkyAppSearchResultsProvider {

  public abstract getSearchResults(searchText: string): Promise<any>;

}
