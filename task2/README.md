# Nudge API Plan

This is my API design for the nudge creation feature. I looked at the wireframe we were given and tried to think through what fields we'd need in the database and how the endpoints should work to build that page.

## 1. Object Data Model

This is what a nudge will look like in the database. Since I'm just using the raw MongoDB driver, there are no schemas, but this is the general shape I'm planning.

```json
{
  "_id": "6a11f23791ce80560079b123",
  "type": "nudge",
  "uid": 45,
  "event_id": "6a11f23791ce80560079b249",
  "title": "this is the title",
  "files": {
    "cover_image": "uploads/cover123.jpg",
    "icon": "uploads/icon456.png"
  },
  "schedule": {
    "date": "2025-10-01T00:00:00.000Z",
    "time": {
      "start": "14:00",
      "end": "16:00"
    }
  },
  "description": "the long text goes here",
  "invitation": "hey check this out",
  "createdAt": "2026-05-24T10:00:00.000Z",
  "updatedAt": "2026-05-24T10:00:00.000Z"
}
```

I kept `schedule` as an object with `date` and `time` separately because the wireframe had a specific date picker and then a from/to timing section. I also made `event_id` an ObjectId since the top dropdown asks what event the nudge is for. The title has a 60 char max just like the picture said.

## 2. API Endpoints

| Widget | Request Type | Base URL | API Endpoint | Payload | Description |
|--------|-------------|----------|--------------|---------|-------------|
| view | GET | `/api/v3/app` | `/nudges?id=:nudge_id` | none | gets a specific nudge by id |
| list | GET | `/api/v3/app` | `/nudges?type=latest&limit=5&page=1` | none | gets newest nudges with pagination |
| create | POST | `/api/v3/app` | `/nudges` | title, event_id, files[cover_image], files[icon], schedule, description, invitation, uid | creates a nudge and returns the id |
| edit | PUT | `/api/v3/app` | `/nudges/:id` | same as post but optional | updates a nudge |
| delete | DELETE | `/api/v3/app` | `/nudges/:id` | none | deletes it from the db |

## 3. How the endpoints work

### GET a nudge by id
- **Method:** GET `/api/v3/app/nudges?id=:id`
- **What it does:** passes in the object id and returns the single nudge document.
- **Success example:**
```json
{
  "success": true,
  "data": { "_id": "123", "title": "my nudge..." }
}
```
- **Errors:** 400 if the id string is bad, 404 if it's not found in the db.

### GET latest nudges
- **Method:** GET `/api/v3/app/nudges?type=latest&limit=5&page=1`
- **What it does:** gets a list of nudges, sorted by newest first.
- **Success example:**
```json
{
  "data": [ { "_id": "123", "title": "my nudge" } ],
  "pagination": { "totalCount": 1, "page": 1, "limit": 5, "pages": 1 }
}
```
- **Errors:** 400 if u forget the type=latest parameter.

### POST to create
- **Method:** POST `/api/v3/app/nudges`
- **What it does:** this creates a nudge. send it as form data since it has images.
- **Payload fields:** uid, event_id, title, schedule date/start/end, description, invitation. Also the two image files.
- **Success example:**
```json
{
  "success": true,
  "insertedId": "6a11f23791ce80560079b123"
}
```
- **Errors:** 413 if the images are bigger than 5mb, 422 if you leave something blank.

### PUT to update
- **Method:** PUT `/api/v3/app/nudges/:id`
- **What it does:** edits an existing nudge. everything is optional so you just send what changed.
- **Payload:** same fields as POST.
- **Success example:**
```json
{
  "success": true,
  "updated": 1
}
```
- **Errors:** 404 if the id doesn't match anything.

### DELETE
- **Method:** DELETE `/api/v3/app/nudges/:id`
- **What it does:** removes the nudge from the collection.
- **Success example:**
```json
{
  "deleted": true,
  "count": 1
}
```

## 4. Directions and notes
- same rules as events API — no mongoose, no schemas, just mongodb
- `_id` is always used to find records, we dont make our own id field
- the database structure is flexible so if we add fields later it won't break
- we only save the path string for the images, not the actual file binary into mongo
