import csv
import requests
from flask import Flask, render_template, jsonify, request

app = Flask(__name__, template_folder='Project3-Team6')

# Define the path to your CSV file (TM-Markets.csv)
CSV_FILE_PATH = 'TM-Markets.csv'

# Load city data from the CSV file into a list of dictionaries
def load_city_data():
    city_data = []
    with open(CSV_FILE_PATH, 'r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            city_data.append({
                'id': row['ID'],
                'name': row['market'],
                'lat': float(row['lat']),
                'lng': float(row['long'])
            })
    return city_data

# Initialize city data
city_data = load_city_data()

# Function to fetch events in a city using the Ticketmaster API
def get_events_in_city(city_name):
    # Replace 'YOUR_API_KEY' with your Ticketmaster API key
    api_key = 'S2v9Md44UbLI7UVMA583AjbIZ4dPB5tu'
    
    # Define the Ticketmaster API URL to fetch events in the city
    api_url = f'https://app.ticketmaster.com/discovery/v2/events.json?city={city_name}&apikey={api_key}&size=10'
  
    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Check for API request errors
        
        data = response.json()
        
        # Process the data and return event details
        # You can customize this part to return event information as needed
        events = data.get('_embedded', {}).get('events', [])
        return events
        
    except requests.exceptions.RequestException as e:
        return []  # Return an empty list for error cases

@app.route('/')
def index():
    return render_template('index.html', city_data=city_data)

@app.route('/events/<city_id>')
def fetch_events(city_id):
    # Find the city by ID
    selected_city = next((city for city in city_data if city['id'] == city_id), None)
    if selected_city:
        city_name = selected_city['name']
        events = get_events_in_city(city_name)
        return jsonify(events)
    else:
        return jsonify([])  # Return an empty list if the city is not found

if __name__ == '__main__':
    app.run(debug=True)