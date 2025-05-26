package services

import (
	"github-issue-tracker-server/models"
)

type IssueService interface {
	CreateIssue(url string) (*models.Issue, error)
	GetIssueByID(id string) (*models.Issue, error)
	GetIssues() ([]models.Issue, error)
	DeleteIssue(id string) error
	GetStatusByID(id string) (*models.IssueStatus, error)
}
