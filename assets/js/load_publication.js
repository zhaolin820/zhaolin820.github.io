document.addEventListener('DOMContentLoaded', function () {
    fetch('data/publications.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load publications: ${response.status}`);
            }

            return response.json();
        })
        .then(data => {
            renderPublications(data.categories);
        })
        .catch(error => {
            console.error(error);

            const container = document.getElementById('publications-container');
            if (container) {
                const fallback = document.createElement('div');
                fallback.className = 'container';
                fallback.textContent = 'Publications could not be loaded.';
                container.appendChild(fallback);
            }
        });

    function parseDate(dateStr) {
        if (!dateStr) return 0;

        const months = {
            "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
            "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
        };

        const parts = dateStr.replace(/[,.]/g, '').split(' ');

        if (parts.length >= 2) {
            const month = months[parts[0]] !== undefined ? months[parts[0]] : 0;
            const year = parseInt(parts[1]);
            return new Date(year, month).getTime();
        }
        return 0;
    }

    function isFirstAuthor(authorsStr) {
        return String(authorsStr || '').trim().startsWith("<b>Z. Wang</b>");
    }

    function safeHref(url) {
        if (!url) return '#';

        try {
            const parsed = new URL(url, window.location.href);
            if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
                return parsed.href;
            }
        } catch (error) {
            // Fall through to the disabled fallback below.
        }

        return '#';
    }

    function appendFormattedAuthors(parent, authorsStr) {
        let isBold = false;
        const tokens = String(authorsStr || '').split(/(<\/?b>)/i);

        tokens.forEach(token => {
            const normalizedToken = token.toLowerCase();

            if (normalizedToken === '<b>') {
                isBold = true;
                return;
            }

            if (normalizedToken === '</b>') {
                isBold = false;
                return;
            }

            if (!token) return;

            if (isBold) {
                const bold = document.createElement('b');
                bold.textContent = token;
                parent.appendChild(bold);
            } else {
                parent.appendChild(document.createTextNode(token));
            }
        });
    }

    function appendItalicText(parent, text) {
        const italic = document.createElement('i');
        italic.textContent = text;
        parent.appendChild(italic);
    }

    function createPublicationItem(item) {
        const listItem = document.createElement('li');

        appendFormattedAuthors(listItem, item.authors);
        listItem.appendChild(document.createTextNode(', \u201c'));

        const titleLink = document.createElement('a');
        titleLink.href = safeHref(item.main_link);
        titleLink.textContent = item.title || 'Untitled';
        listItem.appendChild(titleLink);
        listItem.appendChild(document.createTextNode('\u201d'));

        if (item.journal) {
            listItem.appendChild(document.createTextNode(', '));
            appendItalicText(listItem, item.journal);
        } else if (item.conference) {
            listItem.appendChild(document.createTextNode(', '));
            appendItalicText(listItem, item.conference);
        }

        if (item.status) {
            listItem.appendChild(document.createTextNode(`, ${item.status}`));
        }

        if (item.date) {
            listItem.appendChild(document.createTextNode(`, ${item.date}`));
        }

        const links = Array.isArray(item.links) ? item.links : [];
        if (links.length > 0) {
            listItem.appendChild(document.createTextNode('. ['));
            links.forEach((link, index) => {
                if (index > 0) {
                    listItem.appendChild(document.createTextNode('] ['));
                }

                const anchor = document.createElement('a');
                anchor.href = safeHref(link.url);
                anchor.textContent = link.text || 'Link';
                listItem.appendChild(anchor);
            });
            listItem.appendChild(document.createTextNode(']'));
        }

        listItem.appendChild(document.createTextNode('.'));

        const allowedNoteTypes = new Set(['highlight', 'award']);
        const notes = Array.isArray(item.notes) ? item.notes : [];
        notes.forEach(note => {
            const noteType = allowedNoteTypes.has(note.type) ? note.type : '';
            const badge = document.createElement('span');
            badge.className = ['pub-note', noteType].filter(Boolean).join(' ');
            badge.textContent = note.text || '';

            listItem.appendChild(document.createTextNode(' '));
            listItem.appendChild(badge);
        });

        return listItem;
    }

    function createPublicationList(items) {
        const list = document.createElement('ol');
        list.className = 'paper_table';

        items.forEach(item => {
            list.appendChild(createPublicationItem(item));
        });

        return list;
    }

    function appendSubCategory(section, title, items) {
        const heading = document.createElement('h3');
        heading.className = 'sub-category';
        heading.textContent = title;
        section.appendChild(heading);
        section.appendChild(createPublicationList(items));
    }

    function createCategorySection(category) {
        const sortedItems = [...category.items].sort((a, b) => {
            return parseDate(b.date) - parseDate(a.date);
        });

        const firstAuthorItems = sortedItems.filter(item => isFirstAuthor(item.authors));
        const coAuthorItems = sortedItems.filter(item => !isFirstAuthor(item.authors));

        const section = document.createElement('div');
        section.className = 'container';

        const heading = document.createElement('h2');
        heading.className = 'mono_font';
        heading.textContent = category.title || '';
        section.appendChild(heading);

        if (firstAuthorItems.length > 0 && coAuthorItems.length > 0) {
            appendSubCategory(section, 'First Author', firstAuthorItems);
            appendSubCategory(section, 'Co-Author', coAuthorItems);
        } else {
            section.appendChild(createPublicationList(sortedItems));
        }

        return section;
    }

    function renderPublications(categories) {
        const container = document.getElementById('publications-container');
        if (!container || !Array.isArray(categories)) return;

        categories.forEach(category => {
            if (!Array.isArray(category.items)) return;

            container.appendChild(createCategorySection(category));
        });
    }
});
