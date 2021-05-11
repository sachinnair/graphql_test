import { useState, useEffect } from "react";
import { useQuery, ApolloProvider, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import { client } from "../../App";
import { default as InfoTable } from "../../components/InfoTable";
import { useParams } from "react-router-dom";

const FETCH_REPO_LIST = gql`
  query getRepoListDetails($searchTxt: String!, $after: String, $before: String, $first: Int, $last: Int) {
    search(query: $searchTxt, type: REPOSITORY, first: $first, after: $after, before: $before, last: $last) {
      repositoryCount
      edges {
        node {
          ... on Repository {
            name
            forkCount
            watchers {
              totalCount
            }
          }
        }
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export default function View2({ sendGraphDataForView2 }) {
  const [rows, setRows] = useState([{}]);
  const [columns, setColumns] = useState([
    { id: "repoName", label: "Repository Name" },
    { id: "totalForked", label: "Total Forked" },
    { id: "totalWatchers", label: "Total Watchers" },
  ]);

  
  const { keywrd = "ethereum" } = useParams();
  
  let { data = null, fetchMore, loading } = useQuery(FETCH_REPO_LIST, {
    variables: {
      searchTxt: `sort:forks-desc is:public ${keywrd}`,
      first: 10
    },
  });

  function fetchData(first = 10) {
    const fetchThroughVariables = {
        after: data.search.pageInfo.endCursor,
        first
    };

    fetchMore({ variables : fetchThroughVariables });
  }

  function mapDataToRows(data) {
    if (data) {
      const newRows = data.search.edges.map((x) => {
        const {
          name: repoName,
          forkCount: totalForked,
          watchers: { totalCount: totalWatchers },
        } = x.node;

        return {
          repoName,
          totalForked,
          totalWatchers,
        };
      });
      setRows(oldRows => [...newRows]);
      prepGraphData(newRows);
    }
  }

  function prepGraphData(rData) {
    const xDataLabels = rData.map(x => x.repoName)
    const plot1 = 
          {
            x: xDataLabels,
            y: rData.map(x => x.totalWatchers),
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "red" },
          };

    const plot2 = { type: "bar", x: xDataLabels, y: rData.map(x => x.totalForked) };

    const gData = [plot1, plot2];

    sendGraphDataForView2(gData);
  }

  useEffect(() => {
    mapDataToRows(data);
  }, [data]);

  useEffect(() => {
    return () => sendGraphDataForView2();
  }, [])

  return (
    <>
      <Link to="/">Back</Link>
      {loading ? (
        "...Loading"
      ) : (
        <InfoTable
          rows={rows}
          columns={columns}
          repoCount={data && data.search.repositoryCount}
          fetchData={fetchData}
        />
      )}
    </>
  );
}
