package api

import (
	"encoding/json"
	"fmt"
	"github-issue-tracker/models"
	"github-issue-tracker/services"
	"html/template"
	"net/http"
)

type Server struct {
	service    services.IssueService
	tmplIssues *template.Template
	tmplIssue  *template.Template
}

func NewServer(service services.IssueService) *Server {
	tmplIssues := template.Must(template.ParseGlob("templates/*.html"))
	tmplIssue := template.Must(template.ParseFiles("templates/issue.html"))
	return &Server{service: service, tmplIssues: tmplIssues, tmplIssue: tmplIssue}
}

func (s *Server) GetIssues(w http.ResponseWriter, r *http.Request) {
	issues, err := s.service.GetIssues()
	if err != nil {
		http.Error(w, "Failed to get issues", http.StatusInternalServerError)
		return
	}
	resp := make([]IssueDto, 0, len(issues))
	for _, issue := range issues {
		resp = append(resp, domainToIssueDto(issue))
	}

	if r.Header.Get("HX-Request") == "true" || r.Header.Get("Accept") == "text/html" {
		w.Header().Set("Content-Type", "text/html")
		_ = s.tmplIssues.ExecuteTemplate(w, "issues.html", resp)
		return
	} else {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(resp)
		return
	}
}

func (s *Server) GetIssuesId(w http.ResponseWriter, r *http.Request, id string) {
	issue, err := s.service.GetIssueByID(id)
	if err != nil {
		writeErrorResponse(w, http.StatusNotFound, "Issues not found", err)
		return
	}
	resp := domainToIssueDto(*issue)
	if r.Header.Get("HX-Request") == "true" || r.Header.Get("Accept") == "text/html" {
		w.Header().Set("Content-Type", "text/html")
		_ = s.tmplIssue.Execute(w, resp)
		return
	} else {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(resp)
	}
}

func (s *Server) PostIssues(w http.ResponseWriter, r *http.Request) {
	var dto CreateIssueDto
	err := json.NewDecoder(r.Body).Decode(&dto)
	if err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}
	if err := dto.Validate(); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	created, err := s.service.CreateIssue(*dto.Url)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to create issue", err)
		return
	}
	resp := domainToIssueDto(*created)
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}

func (dto *CreateIssueDto) Validate() error {
	if dto.Url == nil || *dto.Url == "" {
		return fmt.Errorf("url is requiree")
	}
	return nil
}

func (s *Server) DeleteIssuesId(w http.ResponseWriter, r *http.Request, id string) {
	err := s.service.DeleteIssue(id)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to delete issue", err)
		return
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "Issue deleted"})
}

func (s *Server) GetIssuesStatus(w http.ResponseWriter, r *http.Request) {
	issues, err := s.service.GetIssues()
	if err != nil || len(issues) == 0 {
		writeErrorResponse(w, http.StatusNotFound, "No issues found", err)
	}
	results := []IssueStatusDto{}
	for _, issue := range issues {
		status, err := s.service.GetStatusByID(issue.Id)
		if err != nil || len(issues) == 0 {
			writeErrorResponse(w, http.StatusInternalServerError, "Error getting status for issue "+issue.Id, err)
		}
		results = append(results, domainToIssueStatusDto(*status))
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(results)
}

func (s Server) GetIssuesIdStatus(w http.ResponseWriter, r *http.Request, id string) {
	issue, err := s.service.GetStatusByID(id)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to get issue status", err)
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
func writeErrorResponse(w http.ResponseWriter, status int, message string, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	fullMessage := message
	if err != nil {
		fullMessage += ": " + err.Error()
	}
	resp := ErrorResponse{
		Code:    &status,
		Message: &fullMessage,
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
