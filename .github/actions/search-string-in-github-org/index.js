const core = require("@actions/core");
const { Octokit } = require("@octokit/rest");


async function main() {
    try {
        const gtOrg = core.getInput("gthub-org-name") || "";
        const gthubToken = core.getInput("gthub-token") || "";
        const searchString = core.getInput("search-string") || "";
        const fileExtension = core.getInput("file-extension") || "";

        const octokit = new Octokit({
            auth: gthubToken
        });

        let searchResultLength = 1;
        let pageCount = 1;
        let tempSearchResult = [];
        let totalMatchedRepos = 0;
        const perPageResults = 100;

        let queryString = `${searchString} org:${gtOrg}`;
        if(fileExtension) {
            queryString += ` extension:${fileExtension}`;
        }

        do {
            const searchResponse = await octokit.rest.search.code({
                q: queryString,
                order: "asc",
                sort: "indexed",
                per_page: perPageResults,
                page: pageCount
            });
            tempSearchResult = tempSearchResult.concat(searchResponse.data.items);
            searchResultLength = searchResponse.data.items.length;
            pageCount = pageCount + 1;
            if(searchResponse.data.total_count) {
                totalMatchedRepos = searchResponse.data.total_count;
            }
        } while (searchResultLength > 0);

        let searchResult = [];
        if(tempSearchResult && tempSearchResult.length > 0) {
            for(let i = 0; i < tempSearchResult.length; i++) {
                searchResult.push({
                    repoName: tempSearchResult[i].repository.name,
                    repoUrl: tempSearchResult[i].repository.html_url,
                    path: tempSearchResult[i].path,
                    repoNameWithGithubOrg: tempSearchResult[i].repository.full_name
                });
            }
        }

        console.log(`Total repos which contains searched string: ${totalMatchedRepos}`);
        console.log("searchResult: ", searchResult);
    } catch (error) {
        console.log(error.message);
    }
}

main();