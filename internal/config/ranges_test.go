package config

import "testing"

// The live ir.csv contains the two known-hostile shapes: a stray-quoted org
// (`"Pirooz Leen" LLC`) and unquoted commas (`CO.,LTD`). All data rows must
// survive parsing.
func TestLoadRangesFullFile(t *testing.T) {
	ranges, err := LoadRanges("../../ir.csv")
	if err != nil {
		t.Fatal(err)
	}
	if len(ranges) < 1000 {
		t.Fatalf("expected ~1068 ranges, got %d — rows are being swallowed", len(ranges))
	}
	var pirooz, mihan bool
	for _, r := range ranges {
		if r.Org == "Pirooz Leen LLC" {
			pirooz = true
		}
		if r.Org == "MIHAN COMMUNICATION SYSTEMS CO.,LTD" {
			mihan = true
		}
	}
	if !pirooz || !mihan {
		t.Fatalf("malformed-org rows missing: pirooz=%v mihan=%v", pirooz, mihan)
	}
	t.Logf("loaded %d ranges", len(ranges))
}
