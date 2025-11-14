document.addEventListener('DOMContentLoaded', function() {
    fetch('publications.json')
        .then(response => response.json())
        .then(data => {
            renderPublications(data.categories);
        });

    // Helper: Parse "Month. Year" or "Month, Year" into a timestamp for sorting
    function parseDate(dateStr) {
        if (!dateStr) return 0;
        
        // Map months to numbers
        const months = {
            "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
            "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
        };

        // Extract text parts (removes punctuation like . or ,)
        const parts = dateStr.replace(/[,.]/g, '').split(' ');
        
        if (parts.length >= 2) {
            const month = months[parts[0]] !== undefined ? months[parts[0]] : 0;
            const year = parseInt(parts[1]);
            // Return a Date object value (timestamp)
            return new Date(year, month).getTime();
        }
        return 0; // Fallback
    }

    // Helper: Check if Z. Wang is the first author
    function isFirstAuthor(authorsStr) {
        // Check if the string starts with the bolded name tag
        // We trim whitespace to be safe
        return authorsStr.trim().startsWith("<b>Z. Wang</b>");
    }

    // Helper: Generate the HTML list for a set of items
    function generateListHTML(items) {
        if (items.length === 0) return '';
        
        return items.map(item => {
            let entry = `<li>${item.authors}, “<a href="${item.main_link}">${item.title}</a>”`;
            
            if (item.journal) {
                entry += `, <i>${item.journal}</i>`;
            } else if (item.conference) {
                entry += `, <i>${item.conference}</i>`;
            }

            if (item.status) entry += `, ${item.status}`;
            entry += `, ${item.date}`;

            if (item.links?.length > 0) {
                entry += `. [${item.links.map(link => 
                    `<a href="${link.url}">${link.text}</a>`
                ).join('] [')}]`;
            } else {
                entry += `.`;
            }

            if (item.notes && item.notes.length > 0) {
                entry += item.notes.map(note => 
                    `<span class="pub-note ${note.type}">${note.text}</span>`
                ).join(' ');
            }

            return entry + `</li><br>`;
        }).join('');
    }

    function renderPublications(categories) {
        const container = document.getElementById('publications-container');
        
        categories.forEach(category => {
            // 1. Sort items by date (Newest first)
            const sortedItems = category.items.sort((a, b) => {
                return parseDate(b.date) - parseDate(a.date);
            });

            // 2. Split into First Author and Co-Author
            const firstAuthorItems = sortedItems.filter(item => isFirstAuthor(item.authors));
            const coAuthorItems = sortedItems.filter(item => !isFirstAuthor(item.authors));

            // 3. Create the container section
            const section = document.createElement('div');
            section.className = 'container';
            
            // Build the inner HTML
            let innerHTML = `<h2 class="mono_font">${category.title}</h2>`;

            // Logic: If we have both types, separate them. 
            // If we only have one type (or it's a small list like Preprints), you might want to just show the list.
            // Here we default to strictly separating them if both exist.
            
            if (firstAuthorItems.length > 0 && coAuthorItems.length > 0) {
                innerHTML += `
                    <h3 style="margin-top: 15px; color: #555;">First Author</h3>
                    <ol class="paper_table">${generateListHTML(firstAuthorItems)}</ol>
                    
                    <h3 style="margin-top: 15px; color: #555;">Co-Author</h3>
                    <ol class="paper_table">${generateListHTML(coAuthorItems)}</ol>
                `;
            } else {
                // If only one category exists, just render the list without extra sub-headers
                // (Or you can remove this else block to enforce headers even if empty)
                innerHTML += `<ol class="paper_table">${generateListHTML(sortedItems)}</ol>`;
            }

            section.innerHTML = innerHTML;
            container.appendChild(section);
        });
    }
});