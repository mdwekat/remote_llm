FROM python:3.8-slim-buster

# Set the working directory to /app.
WORKDIR /app

# Copy the requirements file into the container at /app/requirements.txt.
COPY requirements.txt .

# Install the dependencies.
RUN pip3 install -r requirements.txt

# Copy the rest of the application code into the container at /app.
COPY . .

# Expose port 5000.
EXPOSE 5000

# Set the FLASK_APP environment variable to the name of your Flask app.
ENV FLASK_APP=app.py

# Set the FLASK_ENV environment variable to development for easier debugging.
ENV FLASK_ENV=development

# Start the Flask app when the container starts.
CMD ["flask", "run", "--host", "0.0.0.0", "--port", "5000"]