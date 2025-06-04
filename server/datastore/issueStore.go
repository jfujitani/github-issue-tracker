package datastore

import (
	"github-issue-tracker/server/models"
)

type IssueStore interface {
	Create(issue models.Issue) (*models.Issue, error)
	GetByID(id string) (*models.Issue, error)
	GetAll() ([]models.Issue, error)
	Update(id string, issue models.Issue) (*models.Issue, error)
	Delete(id string) error
}
