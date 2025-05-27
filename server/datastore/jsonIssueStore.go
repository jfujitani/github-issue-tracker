package datastore

import (
	"encoding/json"
	"fmt"
	"github-issue-tracker-server/models"
	"io"
	"os"
	"sync"
)

// JsonIssueStore is a thread-safe in-memory implementation.
type JsonIssueStore struct {
	mu           sync.RWMutex
	jsonFilePath string
}

func NewJsonIssueStore(filePath string) *JsonIssueStore {
	return &JsonIssueStore{
		jsonFilePath: filePath,
	}
}

func (s *JsonIssueStore) Create(issue models.Issue) (*models.Issue, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if issue.Id == "" {
		return nil, fmt.Errorf("missing id")
	}
	issues, err := s.loadIssues()
	if err != nil {
		return nil, err
	}
	issues[issue.Id] = issue
	if err := s.saveIssues(issues); err != nil {
		return nil, err
	}
	return &issue, nil
}

func (s *JsonIssueStore) GetByID(id string) (*models.Issue, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	issues, err := s.loadIssues()
	if err != nil {
		return nil, err
	}
	issue, ok := issues[id]
	if !ok {
		return nil, fmt.Errorf("not found")
	}
	return &issue, nil
}

func (s *JsonIssueStore) GetAll() ([]models.Issue, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	issues, err := s.loadIssues()
	if err != nil {
		return nil, err
	}
	results := make([]models.Issue, 0, len(issues))
	for _, v := range issues {
		results = append(results, v)
	}
	return results, nil
}

func (s *JsonIssueStore) Update(id string, issue models.Issue) (*models.Issue, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	issues, err := s.loadIssues()
	if err != nil {
		return nil, err
	}
	if _, ok := issues[id]; !ok {
		return nil, fmt.Errorf("not found")
	}
	issues[id] = issue
	if err := s.saveIssues(issues); err != nil {
		return nil, err
	}
	return &issue, nil
}

func (s *JsonIssueStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	issues, err := s.loadIssues()
	if err != nil {
		return err
	}
	if _, ok := issues[id]; !ok {
		return fmt.Errorf("not found")
	}
	delete(issues, id)
	return s.saveIssues(issues)
}

func (s *JsonIssueStore) loadIssues() (map[string]models.Issue, error) {
	file, err := os.Open(s.jsonFilePath)
	if os.IsNotExist(err) {
		return make(map[string]models.Issue), nil
	}
	if err != nil {
		return nil, err
	}
	defer file.Close()
	var issues map[string]models.Issue
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&issues); err != nil && err != io.EOF {
		return nil, err
	}
	if issues == nil {
		issues = make(map[string]models.Issue)
	}
	return issues, nil
}

func (s *JsonIssueStore) saveIssues(Issues map[string]models.Issue) error {
	file, err := os.Create(s.jsonFilePath)
	if err != nil {
		return err
	}
	defer file.Close()
	encoder := json.NewEncoder(file)
	return encoder.Encode(Issues)
}
