package radar

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestFetch(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-token" {
			t.Errorf("missing bearer token, got %q", r.Header.Get("Authorization"))
		}
		w.Write([]byte(`{"success":true,"result":{"marker":"` + r.URL.Path + `"}}`))
	}))
	defer srv.Close()
	baseURL = srv.URL
	t.Setenv("CLOUDFLARE_API_TOKEN", "test-token")

	dir := t.TempDir()
	raw, err := Fetch(context.Background(), dir)
	if err != nil {
		t.Fatal(err)
	}
	var got map[string]json.RawMessage
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatal(err)
	}
	for _, k := range []string{"ts", "traffic_24h_normalized", "confirmed_outages_7d"} {
		if _, ok := got[k]; !ok {
			t.Errorf("missing key %q", k)
		}
	}
	if _, err := os.Stat(dir + "/radar.json"); err != nil {
		t.Errorf("radar.json not written: %v", err)
	}

	// no token → silent no-op
	t.Setenv("CLOUDFLARE_API_TOKEN", "")
	if raw, err := Fetch(context.Background(), dir); raw != nil || err != nil {
		t.Errorf("expected nil,nil without token, got %v %v", raw, err)
	}
}
