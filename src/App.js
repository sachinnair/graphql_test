import "./App.css";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
  ApolloProvider,
} from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { useState } from "react";

import { default as SearchBar } from "./components/SearchBar";
import { default as InfoTable } from "./components/InfoTable";
import { default as ChartArea } from "./components/ChartArea";

import { default as View2 } from "./pages/View2";
// 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

const httpLink = createHttpLink({
  uri: "https://api.github.com/graphql",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = process.env.REACT_APP_GITHUB_PTA;
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `token ${token}` : "",
    },
  };
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        search: relayStylePagination(["query", "first"]),
      },
    },
  },
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});

async function getTotalRepo(keyword = "ethereum") {
  const results = await client.query({
    query: gql`
      query getInfo($searchText: String!) {
        search(query: $searchText, type: REPOSITORY) {
          repositoryCount
        }
      }
    `,
    variables: {
      searchText: `sort:forks-desc is:public ${keyword}`,
    },
  });

  return results?.data?.search?.repositoryCount;
}

function App() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [graphData, setGraphData] = useState([
    { values: [], labels: [], type: "pie" },
  ]);

  async function fetchKeywordInfo(searchTxt) {
    const repoCount = await getTotalRepo(searchTxt);
    setColumns([
      { id: "searchTxt", label: "Search Text" },
      { id: "repoCount", label: "Total Repositories" },
    ]);
    setRows((oldRows) => {
      const id = btoa(searchTxt);
      if (oldRows.findIndex((x) => x.id === id) === -1) {
        return [
          ...oldRows,
          {
            id,
            searchTxt,
            repoCount: <Link to={`/${searchTxt}/drill`}> {repoCount} </Link>,
          },
        ];
      }

      return oldRows;
    });

    setGraphData((oldData) => {
      oldData[0].values = [...oldData[0].values, repoCount];
      oldData[0].labels = [...oldData[0].labels, searchTxt];

      return [...oldData];
    });
  }

  function sendGraphDataForView2(gData = graphData) {
    setGraphData(gData);
  }

  return (
    <div className="App">
      <ChartArea data={graphData} />
      <Router>
        <Switch>
          <Route path="/:keywrd/drill">
            <ApolloProvider client={client}>
              <View2 sendGraphDataForView2={sendGraphDataForView2}></View2>
            </ApolloProvider>
          </Route>
          <Route
            path="/"
            component={() => (
              <>
                <SearchBar fetchKeywordInfo={fetchKeywordInfo} />
                <InfoTable rows={rows} columns={columns} />
              </>
            )}
          ></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
