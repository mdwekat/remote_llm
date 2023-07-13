# Running the Web App

I have created a small Flask api in `app.py` to interact with the model.

## Before you start

Configure the environment variables in `docker-compose-client.yml` to match your environment.
Make sure that the LLM is running and the following environment variables are set:

```ymk
    environment:
      - HF_DATASETS_CACHE=/app/models/cache
      - LLM_HOST=devgrt.aivillage.org
      - LLM_PORT=50055
      - LLM_API_KEY=<KEY> # change this to the actual key if needed
```

To run the app, run the following commands in the terminal:

```bash
docker-compose -f docker-compose-client.yml up
```

This will start the Flask app and the Nuxt web app. The web interface will be available at `http://localhost:50051/` and the
Flask app will be available at `http://localhost:50050/`.

You can tweak the ports in the `docker-compose-client.yml` file.