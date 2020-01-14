import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import MarketList from "../components/MarketList";
import NewMarket from "../components/NewMarket";
import { searchMarkets } from "../graphql/queries";

class HomePage extends React.Component {
  state = {
    searchTerm: "",
    searchResults: [],
    isSearching: false
  };

  handleSearchChange = searchTerm =>
    this.setState({
      searchTerm
    });

  handleClearSearch = () =>
    this.setState({ searchTerm: "", searchResults: [] });

  handleSearch = async e => {
    try {
      const { searchTerm } = this.state;
      e.preventDefault();
      const res = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: searchTerm } },
              { tags: { match: searchTerm } },
              { owner: { match: searchTerm } }
            ]
          },
          sort: {
            field: "createdAt",
            direction: "desc"
          }
        })
      );
      this.setState({
        searchResults: res.data.searchMarkets.items,
        isSearching: false
      });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { searchTerm, isSearching, searchResults } = this.state;
    return (
      <>
        <NewMarket
          searchTerm={searchTerm}
          isSearching={isSearching}
          handleSearchChange={this.handleSearchChange}
          handleClearSearch={this.handleClearSearch}
          handleSearch={this.handleSearch}
        />
        <MarketList searchResults={searchResults} />
      </>
    );
  }
}

export default HomePage;
