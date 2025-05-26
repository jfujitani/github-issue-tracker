package services

type githubIssue struct {
	Title   string `json:"title"`
	State   string `json:"state"`
	HtmlUrl string `json:"html_url"`
}

type StatusProvider interface {
	GetStatus(owner string, repo string, issueNumber int) (*githubIssue, error)
}
