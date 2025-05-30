package api

import (
	"encoding/json"
	"github-issue-tracker/models"
	"github-issue-tracker/services"
	"net/http"
)

type Server struct {
	service services.IssueService
}

func NewServer(service services.IssueService) *Server {
	return &Server{service: service}
}

func (s Server) GetIssues(w http.ResponseWriter, r *http.Request) {
	issues, err := s.service.GetIssues()
	if err != nil {
		http.Error(w, "Failed to get issues", http.StatusInternalServerError)
		return
	}
	resp := make([]IssueDto, 0, len(issues))
	for _, issue := range issues {
		resp = append(resp, domainToIssueDto(issue))
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}

func (s Server) GetIssuesId(w http.ResponseWriter, r *http.Request, id string) {
	issue, err := s.service.GetIssueByID(id)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to get issue")
		return
	}
	resp := domainToIssueDto(*issue)
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}

func (s Server) PostIssues(w http.ResponseWriter, r *http.Request) {
	var dto CreateIssueDto
	err := json.NewDecoder(r.Body).Decode(&dto)
	if err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	created, err := s.service.CreateIssue(*dto.Url)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to create issue")
		return
	}
	resp := domainToIssueDto(*created)
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}

func (s Server) DeleteIssuesId(w http.ResponseWriter, r *http.Request, id string) {
	err := s.service.DeleteIssue(id)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to delete issue")
		return
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "Issue deleted"})
}

func (s Server) GetIssuesStatus(w http.ResponseWriter, r *http.Request) {
	issues, err := s.service.GetIssues()
	if err != nil || len(issues) == 0 {
		writeErrorResponse(w, http.StatusNotFound, "No issues found")
	}
	results := []IssueStatusDto{}
	for _, issue := range issues {
		status, err := s.service.GetStatusByID(issue.Id)
		if err != nil || len(issues) == 0 {
			writeErrorResponse(w, http.StatusInternalServerError, "Error getting status for issue "+issue.Id)
		}
		results = append(results, domainToIssueStatusDto(*status))
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(results)
}

func (s Server) GetIssuesIdStatus(w http.ResponseWriter, r *http.Request, id string) {
	issue, err := s.service.GetStatusByID(id)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to get issue status")
	}

	result := IssueStatusDto{
		Title:  &issue.Title,
		Status: &issue.Status,
		Url:    &issue.Url,
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(result)
}

// Conversion & helpers
func writeErrorResponse(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/jsone")
	w.WriteHeader(status)
	resp := ErrorResponse{
		Code:    &status,
		Message: &message,
	}
	_ = json.NewEncoder(w).Encode(resp)
}

func domainToIssueStatusDto(issue models.IssueStatus) IssueStatusDto {
	return IssueStatusDto{
		Title:  &issue.Title,
		Status: &issue.Status,
		Url:    &issue.Url,
	}
}

func domainToIssueDto(issue models.Issue) IssueDto {
	return IssueDto{
		Id:     &issue.Id,
		Number: &issue.Number,
		Owner:  &issue.Owner,
		Repo:   &issue.Repo,
		Url:    &issue.Url,
	}
}
