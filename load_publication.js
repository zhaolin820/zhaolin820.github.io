document.addEventListener('DOMContentLoaded', function() {
    fetch('publications.json')
        .then(response => response.json())
        .then(data => {
            renderPublications(data.categories);
        });

    function renderPublications(categories) {
        const container = document.getElementById('publications-container');
        
        categories.forEach(category => {
            // 创建模块容器
            const section = document.createElement('div');
            section.className = 'container';
            section.innerHTML = `
                <h2 class="mono_font">${category.title}</h2>
                <ol class="paper_table" id="${category.type}-list"></ol>
            `;
            container.appendChild(section);

            // 渲染条目
            const list = section.querySelector('ol');
            list.innerHTML = category.items.map(item => {
                let entry = `<li>${item.authors}, “<a href="${item.main_link}">${item.title}</a>”`;
                
                // 期刊/会议特有字段
                if (item.journal) {
                    entry += `, <i>${item.journal}</i>`;
                } else if (item.conference) {
                    entry += `, <i>${item.conference}</i>`;
                }

                // 状态和日期
                if (item.status) entry += `, ${item.status}`;
                entry += `, ${item.date}`;

                // 附加链接
                if (item.links?.length > 0) {
                    entry += `. [${item.links.map(link => 
                        `<a href="${link.url}">${link.text}</a>`
                    ).join('] [')}]`;
                } else {
                    entry += `.`;
                }

                // notes
                if (item.notes && item.notes.length > 0) {
                    entry += item.notes.map(note => 
                        `<span class="pub-note ${note.type}">${note.text}</span>`
                    ).join(' ');
                }

                return entry + `</li><br>`;
            }).join('');
        });
    }
});
