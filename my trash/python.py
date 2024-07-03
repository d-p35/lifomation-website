import requests
from bs4 import BeautifulSoup

# Specify the URL
url = "https://webflow.com/"

# Make a request to the website
response = requests.get(url)

# Get the HTML content
html_content = response.text

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Extract the HTML
html = soup.prettify()

# Save HTML to a file
with open('extracted.html', 'w', encoding='utf-8') as file:
    file.write(html)

# To extract CSS, find all link tags with rel="stylesheet"
css_links = soup.find_all('link', rel='stylesheet')

# Download and save each CSS file
for link in css_links:
    css_url = link['href']
    if css_url.startswith('http'):  # Check if it's an absolute URL
        css_response = requests.get(css_url)
    else:  # If it's a relative URL
        css_response = requests.get(url + css_url)
    css_content = css_response.text

    # Save CSS to a file
    css_filename = css_url.split('/')[-1]
    with open(css_filename, 'w', encoding='utf-8') as file:
        file.write(css_content)
