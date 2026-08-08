"""
celery_worker/app.py
--------------------
Celery application instance — shared between tasks.py and the gateway.
"""

from __future__ import annotations

import os

from celery import Celery

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")

celery_app = Celery(
    "trinetra",
    broker=REDIS_URL,
    backend=f"mongodb://{MONGODB_URI.split('://')[-1]}/trinetra",
)

celery_app.conf.update(
    # ── Queues (Section 9 tier routing) ────────────────────────────────────────
    task_queues={
        "enterprise": {"exchange": "enterprise", "routing_key": "enterprise"},
        "premium":    {"exchange": "premium",    "routing_key": "premium"},
        "basic":      {"exchange": "basic",       "routing_key": "basic"},
    },
    task_default_queue="basic",
    task_default_exchange="basic",
    task_default_routing_key="basic",

    # ── Serialization ──────────────────────────────────────────────────────────
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],

    # ── Timeouts ──────────────────────────────────────────────────────────────
    task_soft_time_limit=120,   # 2 min soft (raises SoftTimeLimitExceeded)
    task_time_limit=180,        # 3 min hard kill

    # ── Result expiry ─────────────────────────────────────────────────────────
    result_expires=3600 * 24 * 7,  # 7 days

    # ── Retry / acks ──────────────────────────────────────────────────────────
    task_acks_late=True,
    task_reject_on_worker_lost=True,

    # ── Worker autoscaling ────────────────────────────────────────────────────
    # Autoscale between 1 and 8 concurrent tasks per worker process.
    # Add more worker processes / nodes as GPU capacity grows.
    worker_autoscaler="celery.worker.autoscale:Autoscaler",

    # ── Imports ───────────────────────────────────────────────────────────────
    include=["celery_worker.tasks"],
)
