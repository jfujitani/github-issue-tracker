package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"github-issue-tracker-server/datastore"
	"github-issue-tracker-server/models"
	"net/url"
	"strings"
)

// IssueService provides business logic for issues.
type IssueServiceImpl struct {
	store datastore.IssueStore
}

// NewIssueService constructs an IssueService with an injected IssueStore.
func NewIssueService(store datastore.IssueStore) *IssueServiceImpl {
	return &IssueServiceImpl{store: store}
}

var lastID = 0

func (s *IssueServiceImpl) CreateIssue(inputUrl string) (*models.Issue, error) {
	parsed, err := url.Parse(inputUrl)
	if err != nil {
		return nil, err
	}

	parts := strings.Split(parsed.Path, "/")
	// Expecting: ["", "owner", "repo", "issues", "number"]
	if len(parts) < 5 || parts[3] != "issues" {
		return nil, err
	}

	owner := parts[1]
	repo := parts[2]
	numberStr := parts[4]
	urlCopy := inputUrl

	var number float32
	_, err = fmt.Sscanf(numberStr, "%f", &number)
	if err != nil {
		return nil, err
	}

	newID := generateID()

	newIssue := models.Issue{
		Id:     newID,
		Owner:  owner,
		Repo:   repo,
		Number: number,
		Url:    urlCopy,
	}

	return s.store.Create(newIssue)
}

func (s *IssueServiceImpl) GetIssueByID(id string) (*models.Issue, error) {
	return s.store.GetByID(id)
}

func (s *IssueServiceImpl) GetIssues() ([]models.Issue, error) {
	return s.store.GetAll()
}

func (s *IssueServiceImpl) DeleteIssue(id string) error {
	return s.store.Delete(id)
}

func (s *IssueServiceImpl) GetStatusByID(id string) (*models.IssueStatus, error) {
	result := models.IssueStatus{
		Title:  "Issue Status",
		Status: "Open",
		Url:    "asdfasdfasd",
	}
	return &result, nil
}

// generateID creates a unique 16-character hex string.
func generateID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
