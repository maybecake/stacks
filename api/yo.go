package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type yoRequest struct {
	Name string `json:"name"`
}

type yoResponse struct {
	Message string `json:"message"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req yoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	resp := yoResponse{Message: fmt.Sprintf("Yo, %s!", req.Name)}
	w.Header().Set("Content-Type", "application/connect+json")
	json.NewEncoder(w).Encode(resp) //nolint:errcheck
}
