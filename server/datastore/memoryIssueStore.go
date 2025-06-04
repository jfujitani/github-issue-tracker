package datastore

import (
	"fmt"
	"github-issue-tracker/server/models"
	"sync"
)

// MemoryIssueStore is a thread-safe in-memory implementation.
type MemoryIssueStore struct {
	mu     sync.RWMutex
	issues map[string]models.Issue
}

func NewMemoryIssueStore() *MemoryIssueStore {
	return &MemoryIssueStore{
		issues: make(map[string]models.Issue),
	}
}

func (s *MemoryIssueStore) Create(issue models.Issue) (*models.Issue, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if issue.Id == "" {
		return nil, fmt.Errorf("missing id")
	}
	s.issues[issue.Id] = issue
	return &issue, nil
}

func (s *MemoryIssueStore) GetByID(id string) (*models.Issue, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	issue, ok := s.issues[id]
	if !ok {
		return nil, fmt.Errorf("not found")
	}
	return &issue, nil
}

func (s *MemoryIssueStore) GetAll() ([]models.Issue, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]models.Issue, 0, len(s.issues))
	for _, v := range s.issues {
		result = append(result, v)
	}
	return result, nil
}

func (s *MemoryIssueStore) Update(id string, issue models.Issue) (*models.Issue, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.issues[id]; !ok {
		return nil, fmt.Errorf("not found")
	}
	s.issues[id] = issue
	return &issue, nil
}

func (s *MemoryIssueStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.issues[id]; !ok {
		return fmt.Errorf("not found")
	}
	delete(s.issues, id)
	return nil
}
