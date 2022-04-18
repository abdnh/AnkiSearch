.PHONY: clean build run srcdist

NAME := AnkiSearch

DEPS := $(shell git ls-tree -r master --name-only)
build: $(DEPS)
	web-ext build --overwrite-dest

run: $(DEPS)
	web-ext run

srcdist: $(NAME)_sources.zip

$(NAME)_sources.zip: $(DEPS)
	git archive HEAD --format=zip --output $(NAME)_sources.zip

clean:
	rm -rf web-ext-artifacts
	rm -f $(NAME)_sources.zip
