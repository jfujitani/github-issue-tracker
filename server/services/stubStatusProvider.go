package services

import (
	"fmt"
)

type stubStatusProvider struct{}

func NewstubStatusProvider() *stubStatusProvider {
	return &stubStatusProvider{}
}

func (*stubStatusProvider) GetStatus(owner string, repo string, issueNumber int) (*githubIssue, error) {
	ghIssue := githubIssue{
		State:   "open",
		Title:   "my issue",
		HtmlUrl: fmt.Sprintf("github.com/%s/%s/issues/%d", owner, repo, issueNumber),
	}

	return &ghIssue, nil
}
