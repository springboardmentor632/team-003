import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import {
  createCommunity,
  joinCommunity,
  leaveCommunity,
  listCommunities,
} from "../api/collaboration";
import { extractErrorMessage } from "../api/client";

export default function Communities() {
  const navigate = useNavigate();

  const [communities, setCommunities] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [membershipId, setMembershipId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");

    listCommunities()
      .then(({ data }) => setCommunities(data))
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Couldn't load communities"
          )
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    setError("");
    setCreating(true);

    try {
      const { data } = await createCommunity({
        name,
        description,
      });

      setCommunities((items) => [
        data,
        ...items,
      ]);

      setName("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          "Couldn't create community"
        )
      );
    } finally {
      setCreating(false);
    }
  };

  const toggleMembership = async (community) => {
    setMembershipId(community.id);
    setError("");

    try {
      const { data } = community.joined
        ? await leaveCommunity(community.id)
        : await joinCommunity(community.id);

      setCommunities((items) =>
        items.map((item) =>
          item.id === community.id
            ? data
            : item
        )
      );
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          "Couldn't update membership"
        )
      );
    } finally {
      setMembershipId(null);
    }
  };

  return (
    <div>
      <TopBar
        eyebrow="Collaborate"
        title="Communities"
        subtitle="Bring people together around decisions they care about."
        action={
          <button
            className="btn brass"
            onClick={() =>
              setShowForm((value) => !value)
            }
          >
            {showForm
              ? "Cancel"
              : "+ New community"}
          </button>
        }
      />

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {showForm && (
        <form
          className="form-card"
          onSubmit={create}
          style={{ marginBottom: 24 }}
        >
          <div className="field">
            <label>Name</label>

            <input
              value={name}
              required
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="e.g. Product leaders"
            />
          </div>

          <div className="field">
            <label>Description</label>

            <input
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="What brings this group together?"
            />
          </div>

          <button
            className="btn brass"
            type="submit"
            disabled={creating}
          >
            {creating
              ? "Creating…"
              : "Create community"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="state-block">
          Loading communities…
        </div>
      ) : communities.length === 0 ? (
        <div className="state-block">
          <h3>No communities yet</h3>
          <p>
            Create the first space for shared
            decisions.
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {communities.map((community) => {
            const membershipLoading =
              membershipId === community.id;

            return (
              <article
                className="card"
                key={community.id}
                onClick={() =>
                  navigate(
                    `/communities/${community.id}`
                  )
                }
              >
                <div className="card-top">
                  <span className="cat">
                    Community
                  </span>

                  <span>
                    {community.memberCount} members
                  </span>
                </div>

                <h3>{community.name}</h3>

                <p>
                  {community.description ||
                    "A place to compare options and decide together."}
                </p>

                <div className="card-foot">
                  <span>
                    {community.joined
                      ? "You’re a member"
                      : "Open to join"}
                  </span>

                  <button
                    className="btn ghost"
                    disabled={membershipLoading}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleMembership(community);
                    }}
                  >
                    {membershipLoading
                      ? "Updating…"
                      : community.joined
                      ? "Leave"
                      : "Join"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}