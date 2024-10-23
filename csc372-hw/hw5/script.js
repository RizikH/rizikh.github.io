"use strict";

window.addEventListener("DOMContentLoaded", async () => {
    const searchBtn = document.querySelector('#search-button');

    // Loads personal repo initially
    await onLoad;

    searchBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        await fetchRepo(username);
    });
});

async function fetchRepo(username) {
    const url = "https://api.github.com/users/" + username + "/repos";

    try {
        const response = await fetch(url);
        const data = await response.json();

        const repoList = document.querySelector('#repo-list');
        repoList.innerHTML = '';

        if (data.message === "Not Found") {
            repoList.innerHTML = '<p>User Not Found, Please Try Again.</p>';
            return;
        }

        // Create an array of promises for creating the cards
        const cardPromises = data.map(repo => createCard(repo));
        const repoCards = await Promise.all(cardPromises);

        // Append all the cards after all are ready
        repoCards.forEach(repoCard => repoList.appendChild(repoCard));
    } catch (error) {
        console.error("Error fetching repo: " + error);
        repoList.innerHTML = '<p>There was an error fetching the repositories.</p>';
    }
}


async function createCard(repo) {
    const repoCard = document.createElement('section');
    repoCard.classList.add('repo');

    const header = createCardHeader(repo);
    const cardInfo = await createCardInfo(repo);

    repoCard.append(header, cardInfo);

    return repoCard;
}


function createCardHeader(repo) {
    const repoHeader = document.createElement('section');
    repoHeader.classList.add('repo-header');

    const headerImg = document.createElement('img');
    headerImg.src = 'assets/github-mark.png';
    headerImg.alt = 'repo-header-img';

    const headerLink = document.createElement('a');
    headerLink.href = repo.html_url;
    headerLink.textContent = repo.name;
    headerLink.target = '_blank'; // Open in a new tab

    repoHeader.append(headerImg, headerLink);

    return repoHeader;
}

async function createCardInfo(repo) {
    const cardInfo = document.createElement('section');
    cardInfo.classList.add('repo-info');

    const cardInfoPara = document.createElement('p');
    cardInfoPara.textContent = repo.description ? repo.description : 'No description available';

    const cardInfoUl = document.createElement('ul');

    // Fetch the commit count in parallel
    const [commits, updated, created, languages, Watchers] = await Promise.all([
        createCardInfoCommitsList(repo),
        createCardInfoUpdatedList(repo),
        createCardInfoCreatedList(repo),
        createCardInfoLanguagesList(repo),
        createCardInfoWatchersList(repo)
    ]);

    cardInfoUl.append(commits, updated, created, languages, Watchers);
    cardInfo.append(cardInfoPara, cardInfoUl);

    return cardInfo;
}

// Creates the list item for the number of commits. 
//It calls a function that does a second fetch to a different api url
async function createCardInfoCommitsList(repo) {
    const listItem = document.createElement('li');
    const listItemSpan = document.createElement('span');

    listItemSpan.classList.add('bold');
    listItemSpan.textContent = 'Commits:';

    listItem.appendChild(listItemSpan);
    const totalCommits = await getTotalCommits(repo.owner.login, repo.name);
    listItem.append(" " + totalCommits);
    return listItem;
}

// Creates the list item for the updated at date
function createCardInfoUpdatedList(repo) {
    const listItem = document.createElement('li');
    const listItemSpan = document.createElement('span');

    listItemSpan.classList.add('bold');
    listItemSpan.textContent = 'Updated:';

    listItem.appendChild(listItemSpan);
    listItem.append(" " + new Date(repo.updated_at).toLocaleDateString());
    return listItem;
}

// Creates the list item for the created at date
function createCardInfoCreatedList(repo) {
    const listItem = document.createElement('li');
    const listItemSpan = document.createElement('span');

    listItemSpan.classList.add('bold');
    listItemSpan.textContent = 'Created:';

    listItem.appendChild(listItemSpan);
    listItem.append(" " + new Date(repo.created_at).toLocaleDateString());
    return listItem;
}

async function createCardInfoLanguagesList(repo) {
    const listItem = document.createElement('li');
    const listItemSpan = document.createElement('span');

    listItemSpan.classList.add('bold');
    listItemSpan.textContent = 'Languages:';

    listItem.appendChild(listItemSpan);

    try {
        const response = await fetch(repo.languages_url);
        const data = await response.json();
        const languages = Object.keys(data).join(', ');
        if (languages === "") {
            listItem.append(" " + " No languages available")
            return listItem;
        }
        listItem.append(" " + languages);
    } catch (error) {
        console.error("Error fetching languages:", error);
        listItem.append(" No languages available");
    }

    return listItem;
}

function createCardInfoWatchersList(repo) {
    const listItem = document.createElement('li');
    const listItemSpan = document.createElement('span');

    listItemSpan.classList.add('bold');
    listItemSpan.textContent = 'Watchers:';

    listItem.appendChild(listItemSpan);
    listItem.append(" " + repo.watchers_count);

    return listItem;
}

// Fetches the total number of commits for a given repository
async function getTotalCommits(owner, repoName) {
    const commitsUrl = `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=1`;
    try {
        const response = await fetch(commitsUrl);
        if (response.status !== 200) {
            console.error("Error fetching commits:", response.status);
            return 0;
        }
        const linkHeader = response.headers.get("link");
        if (linkHeader) {
            // Extract the last page number from the Link header
            const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
            if (lastPageMatch) {
                return parseInt(lastPageMatch[1], 10);
            }
        }
        // If no Link header is available, it means there is only one page
        const commits = await response.json();
        return commits.length;
    } catch (error) {
        console.error("Error:", error);
        return 0;
    }
}

// Fetches and displays my personal repositories on initial load
async function onLoad() {
    await fetchRepo('RizikH');
}
