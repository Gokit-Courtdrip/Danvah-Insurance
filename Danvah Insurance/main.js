// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function () {

    // Initialize AOS (Animate on Scroll) library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700, // Using a snappier duration
            once: true,
        });
    }

    // --- News Feed Fetching ---
    // The API key is now hidden in a serverless function.
    const newsFeed = document.getElementById('news-feed');

    if (newsFeed) {
        // Call our own serverless function endpoint
        fetch('/.netlify/functions/get-news')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("API Response:", data);

                // Handle API errors returned in the JSON body
                if (data.status === 'error') {
                    throw new Error(data.message || 'The news service returned an error.');
                }

                if (!data.articles || data.articles.length === 0) {
                    newsFeed.innerHTML = '<p class="text-center col-12">No news articles available at the moment.</p>';
                    return;
                }

                // Display the first 3 articles
                data.articles.slice(0, 3).forEach(article => {
                    const col = document.createElement('div');
                    col.className = 'col-md-4 mb-4';

                    // Use fallbacks for potentially missing data
                    const title = article.title || 'No Title Available';
                    const description = article.description || 'No description available.';
                    const image = article.urlToImage || 'https://via.placeholder.com/400x250?text=News';
                    const url = article.url || '#';

                    col.innerHTML = `
                        <div class="blog-post image-zoom theme-shadow h-100">
                            <div class="image-zoom-wrapper">
                                <img src="${image}" alt="Image for news article: ${title}" class="img-fluid rounded" loading="lazy">
                            </div>
                            <div class="p-4 d-flex flex-column">
                                <h5 class="flex-grow-1">${title}</h5>
                                <p>${description}</p>
                                <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-brand mt-2 align-self-start">Read More</a>
                            </div>
                        </div>
                    `;

                    newsFeed.appendChild(col);
                });
            })
            .catch(err => {
                console.error('Fetch error:', err);
                newsFeed.innerHTML = `<p class="text-center text-danger col-12">Failed to load news. This feature may not work when running the file locally. Try using the Netlify dev server or check the deployed site.</p>`;
            });
    }


    // --- Formspree Contact Form Handling ---
    const contactForm = document.querySelector('form[action*="formspree.io"]');
    const formMessageDiv = document.getElementById('form-message');

    if (contactForm && formMessageDiv) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    formMessageDiv.innerHTML = '<p class="text-success">✅ Message sent successfully!</p>';
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        const errorMsg = data.errors ? data.errors.map(error => error.message).join(', ') : 'Something went wrong.';
                        formMessageDiv.innerHTML = `<p class="text-danger">❌ Error: ${errorMsg}</p>`;
                    });
                }
            }).catch(error => {
                console.error('Form submission error:', error);
                formMessageDiv.innerHTML = '<p class="text-danger">⚠️ Network error. Please check your connection and try again.</p>';
            });
        });
    }

    // --- Dynamic Copyright Year ---
    const copyrightYearSpan = document.getElementById('copyright-year');
    if (copyrightYearSpan) {
        copyrightYearSpan.textContent = new Date().getFullYear();
    }
});