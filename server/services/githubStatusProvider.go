package services

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type GithubStatusProvider struct{}

func NewGithubStatusProvider() *GithubStatusProvider {
	return &GithubStatusProvider{}
}

func (*GithubStatusProvider) GetStatus(owner string, repo string, issueNumber int) (*githubIssue, error) {
	apiUrl := fmt.Sprintf("https://api.github.com/repos/%s/%s/issues/%d", owner, repo, issueNumber)
	resp, err := http.Get(apiUrl)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var ghIssue githubIssue
	if err := json.NewDecoder(resp.Body).Decode(&ghIssue); err != nil {
		return nil, err
	}

	return &ghIssue, nil
}
